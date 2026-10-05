package com.morphlet.utils

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Picture
import android.graphics.drawable.GradientDrawable
import android.view.View
import android.view.ViewGroup
import com.facebook.react.uimanager.BackgroundStyleApplicator
import com.facebook.react.uimanager.LengthPercentageType
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.facebook.react.uimanager.style.BorderRadiusProp
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

object MorphletSnapshot {
  private const val OPAQUE = 0.999f
  private const val MAX_SURFACE_DEPTH = 6
  private const val SURFACE_TOLERANCE_DP = 2f

  fun record(view: View): Picture? = record(view) { canvas -> view.draw(canvas) }

  fun recordContents(view: View): Picture? {
    val chain = surfaceChain(view)
    return record(view) { canvas -> drawContents(view, chain, canvas) }
  }

  private fun drawContents(view: View, chain: List<View>, canvas: Canvas) {
    val group = view as? ViewGroup ?: return
    for (index in 0 until group.childCount) {
      val child = group.getChildAt(index)
      if (child.visibility != View.VISIBLE) {
        continue
      }
      val saveCount = canvas.save()
      canvas.translate(child.left.toFloat(), child.top.toFloat())
      canvas.concat(child.matrix)
      if (child is ViewGroup && child in chain) {
        drawContents(child, chain, canvas)
      } else {
        child.draw(canvas)
      }
      canvas.restoreToCount(saveCount)
    }
  }

  fun surfaceChain(view: View): List<View> {
    val chain = mutableListOf(view)
    val tolerance = SURFACE_TOLERANCE_DP.dpToPx()
    var current = view
    var offsetX = 0f
    var offsetY = 0f
    repeat(MAX_SURFACE_DEPTH) {
      val group = current as? ViewGroup ?: return chain
      var filling: View? = null
      for (index in group.childCount - 1 downTo 0) {
        val child = group.getChildAt(index)
        if (child.visibility != View.VISIBLE || child.alpha < 0.01f) continue
        val left = offsetX + child.left + child.translationX
        val top = offsetY + child.top + child.translationY
        if (left <= tolerance && top <= tolerance &&
          left + child.width >= view.width - tolerance && top + child.height >= view.height - tolerance
        ) {
          filling = child
          break
        }
      }
      val next = filling ?: return chain
      offsetX += next.left + next.translationX
      offsetY += next.top + next.translationY
      chain += next
      current = next
    }
    return chain
  }

  fun visibleBackgroundColor(view: View, fallback: Int): Int {
    val rgba = FloatArray(4)
    val chain = surfaceChain(view)
    val opacities = FloatArray(chain.size)
    var opacity = 1f
    chain.forEachIndexed { index, surface ->
      opacity *= surface.alpha
      opacities[index] = opacity
    }

    var current: View? = chain.lastOrNull { BackgroundStyleApplicator.getBackgroundColor(it) != null } ?: view
    while (current != null && rgba[3] < OPAQUE) {
      val index = chain.indexOf(current)
      BackgroundStyleApplicator.getBackgroundColor(current)?.let {
        composite(rgba, it, if (index >= 0) opacities[index] else 1f)
      }
      current = current.parent as? View
    }
    if (rgba[3] < OPAQUE) {
      composite(rgba, fallback)
    }

    val alpha = max(rgba[3], 0.001f)
    return Color.rgb(
      (rgba[0] / alpha * 255).roundToInt().coerceIn(0, 255),
      (rgba[1] / alpha * 255).roundToInt().coerceIn(0, 255),
      (rgba[2] / alpha * 255).roundToInt().coerceIn(0, 255),
    )
  }

  fun cornerRadius(view: View): Float {
    val limit = min(view.width, view.height) / 2f
    for (surface in surfaceChain(view)) {
      val radius = ownCornerRadius(surface)
      if (radius > 0f) return min(radius, limit)
    }
    return 0f
  }

  private fun ownCornerRadius(view: View): Float {
    val radius =
      BackgroundStyleApplicator.getBorderRadius(view, BorderRadiusProp.BORDER_RADIUS)
        ?: BackgroundStyleApplicator.getBorderRadius(view, BorderRadiusProp.BORDER_TOP_LEFT_RADIUS)
    if (radius == null) {
      return (view.background as? GradientDrawable)?.cornerRadius ?: 0f
    }
    val shortestSide = min(view.width, view.height).toFloat()
    val resolved =
      if (radius.type == LengthPercentageType.PERCENT) {
        radius.resolve(shortestSide)
      } else {
        radius.resolve(0f).dpToPx()
      }
    return min(resolved, shortestSide / 2)
  }

  private fun record(view: View, draw: (Canvas) -> Unit): Picture? {
    if (view.width <= 0 || view.height <= 0) {
      return null
    }
    return try {
      Picture().apply {
        draw(beginRecording(view.width, view.height))
        endRecording()
      }
    } catch (error: RuntimeException) {
      null
    }
  }

  private fun composite(rgba: FloatArray, color: Int, opacity: Float = 1f) {
    val alpha = Color.alpha(color) / 255f * opacity
    val remaining = 1 - rgba[3]
    rgba[0] += Color.red(color) / 255f * alpha * remaining
    rgba[1] += Color.green(color) / 255f * alpha * remaining
    rgba[2] += Color.blue(color) / 255f * alpha * remaining
    rgba[3] += alpha * remaining
  }
}
