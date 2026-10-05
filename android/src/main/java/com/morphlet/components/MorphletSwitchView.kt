package com.morphlet.components

import android.content.Context
import android.graphics.Canvas
import android.graphics.RectF
import android.view.View
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UIManager
import com.facebook.react.bridge.UIManagerListener
import com.facebook.react.common.annotations.UnstableReactNativeAPI
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType
import com.facebook.react.views.view.ReactViewGroup
import com.morphlet.animation.MorphletSpring
import com.morphlet.animation.MorphletSpring.Companion.lerp
import com.morphlet.animation.MorphletSpringConfig
import com.morphlet.utils.MorphletSnapshot
import com.morphlet.views.MorphletSnapshotLayer
import kotlin.math.min

@OptIn(UnstableReactNativeAPI::class)
class MorphletSwitchView(context: Context) : ReactViewGroup(context), UIManagerListener {

  var transition = TRANSITION_MORPH
  var direction = DIRECTION_FORWARD
  var duration = 0.25f
  var spring: MorphletSpringConfig? = null

  private val capturedLayers = HashMap<View, MorphletSnapshotLayer>()
  private val outgoingLayers = mutableListOf<MorphletSnapshotLayer>()
  private val pendingOutgoing = mutableListOf<MorphletSnapshotLayer>()
  private val pendingIncoming = mutableListOf<View>()
  private var isReady = false
  private var isCapturing = false

  private val uiManager: UIManager?
    get() = (context as? ReactContext)?.let { UIManagerHelper.getUIManager(it, UIManagerType.FABRIC) }

  init {
    setWillNotDraw(false)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    uiManager?.addUIManagerEventListener(this)
  }

  override fun onDetachedFromWindow() {
    uiManager?.removeUIManagerEventListener(this)
    super.onDetachedFromWindow()
  }

  override fun addView(child: View, index: Int, params: LayoutParams?) {
    super.addView(child, index, params)
    if (isCapturing) pendingIncoming.add(child)
  }

  override fun removeViewAt(index: Int) {
    getChildAt(index)?.let { willRemove(it) }
    super.removeViewAt(index)
  }

  override fun removeView(view: View?) {
    view?.let { willRemove(it) }
    super.removeView(view)
  }

  override fun willMountItems(uiManager: UIManager) {
    isCapturing = isReady && isShown
    capturedLayers.clear()
    if (!isCapturing) return
    for (index in 0 until childCount) {
      val child = getChildAt(index)
      val picture = MorphletSnapshot.record(child) ?: continue
      capturedLayers[child] =
        MorphletSnapshotLayer(
          picture,
          RectF(child.left.toFloat(), child.top.toFloat(), child.right.toFloat(), child.bottom.toFloat()),
        ).apply {
          alpha = child.alpha
          translationX = child.translationX
          translationY = child.translationY
          scale = child.scaleX
        }
    }
  }

  override fun didMountItems(uiManager: UIManager) {
    val wasCapturing = isCapturing
    isCapturing = false
    isReady = true
    capturedLayers.clear()

    val outgoing = pendingOutgoing.toList()
    val incoming = pendingIncoming.toList()
    pendingOutgoing.clear()
    pendingIncoming.clear()
    if (!wasCapturing || (outgoing.isEmpty() && incoming.isEmpty())) return

    runTransition(outgoing, incoming)
  }

  override fun willDispatchViewUpdates(uiManager: UIManager) = Unit

  override fun didDispatchMountItems(uiManager: UIManager) = Unit

  override fun didScheduleMountItems(uiManager: UIManager) = Unit

  override fun dispatchDraw(canvas: Canvas) {
    outgoingLayers.forEach { it.draw(canvas) }
    super.dispatchDraw(canvas)
  }

  private fun willRemove(child: View) {
    if (!isCapturing) return
    capturedLayers.remove(child)?.let { pendingOutgoing.add(it) }
  }

  private fun runTransition(outgoing: List<MorphletSnapshotLayer>, incoming: List<View>) {
    outgoingLayers.addAll(outgoing)
    val sign = if (direction == DIRECTION_BACKWARD) -1f else 1f

    val outgoingStart = outgoing.map { Snapshot(it.alpha, it.translationX, it.translationY, it.scale) }
    val outgoingEnd = outgoing.map { exitState(it.bounds.height(), sign) }
    val incomingEnd = incoming.map { Snapshot(it.alpha.takeIf { alpha -> alpha > 0f } ?: 1f, 0f, 0f, 1f) }
    val incomingStart = incoming.map { enterState(it.height.toFloat(), sign) }
    incoming.forEachIndexed { index, view -> incomingStart[index].applyTo(view) }

    val config = spring ?: MorphletSpringConfig.fromResponse(duration, 0.7f)
    MorphletSpring.start(
      config,
      onUpdate = { progress ->
        incoming.forEachIndexed { index, view ->
          incomingStart[index].interpolate(incomingEnd[index], progress).applyTo(view)
        }
        outgoing.forEachIndexed { index, layer ->
          outgoingStart[index].interpolate(outgoingEnd[index], progress).applyTo(layer)
        }
        invalidate()
      },
      onEnd = {
        outgoingLayers.removeAll(outgoing)
        incoming.forEachIndexed { index, view -> incomingEnd[index].applyTo(view) }
        invalidate()
      },
    )
  }

  private fun verticalShift(height: Float): Float = min(MAXIMUM_SHIFT.dpToPx(), height * 0.5f)

  private fun enterState(height: Float, sign: Float): Snapshot =
    when (transition) {
      TRANSITION_SLIDE -> Snapshot(0f, width * sign, 0f, 1f)
      TRANSITION_SCALE -> Snapshot(0f, 0f, 0f, SCALED)
      TRANSITION_FADE -> Snapshot(0f, 0f, 0f, 1f)
      else -> Snapshot(0f, 0f, -verticalShift(height), MORPH_ENTER_SCALE)
    }

  private fun exitState(height: Float, sign: Float): Snapshot =
    when (transition) {
      TRANSITION_SLIDE -> Snapshot(0f, -width * sign, 0f, 1f)
      TRANSITION_SCALE -> Snapshot(0f, 0f, 0f, SCALED)
      TRANSITION_FADE -> Snapshot(0f, 0f, 0f, 1f)
      else -> Snapshot(0f, 0f, verticalShift(height), MORPH_EXIT_SCALE)
    }

  private data class Snapshot(val alpha: Float, val translationX: Float, val translationY: Float, val scale: Float) {
    fun interpolate(to: Snapshot, progress: Float): Snapshot =
      Snapshot(
        lerp(alpha, to.alpha, progress).coerceIn(0f, 1f),
        lerp(translationX, to.translationX, progress),
        lerp(translationY, to.translationY, progress),
        lerp(scale, to.scale, progress),
      )

    fun applyTo(view: View) {
      view.alpha = alpha
      view.translationX = translationX
      view.translationY = translationY
      view.scaleX = scale
      view.scaleY = scale
    }

    fun applyTo(layer: MorphletSnapshotLayer) {
      layer.alpha = alpha
      layer.translationX = translationX
      layer.translationY = translationY
      layer.scale = scale
    }
  }

  companion object {
    const val TRANSITION_MORPH = "morph"
    const val TRANSITION_SLIDE = "slide"
    const val TRANSITION_FADE = "fade"
    const val TRANSITION_SCALE = "scale"
    const val DIRECTION_FORWARD = "forward"
    const val DIRECTION_BACKWARD = "backward"

    private const val MAXIMUM_SHIFT = 100f
    private const val SCALED = 0.8f
    private const val MORPH_ENTER_SCALE = 1.05f
    private const val MORPH_EXIT_SCALE = 0.95f
  }
}
