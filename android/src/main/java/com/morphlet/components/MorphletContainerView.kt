package com.morphlet.components

import android.content.Context
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UIManager
import com.facebook.react.bridge.UIManagerListener
import com.facebook.react.common.annotations.UnstableReactNativeAPI
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType
import com.facebook.react.views.view.ReactViewGroup
import com.morphlet.animation.MorphletLayoutAnimator
import com.morphlet.protocols.MorphletContainerViewDelegate

@OptIn(UnstableReactNativeAPI::class)
class MorphletContainerView(context: Context) : ReactViewGroup(context), UIManagerListener {

  var delegate: MorphletContainerViewDelegate? = null

  private val layoutAnimator = MorphletLayoutAnimator(this)
  private var didCapture = false
  private var reportedWidth = 0
  private var reportedHeight = 0

  private val uiManager: UIManager?
    get() = (context as? ReactContext)?.let { UIManagerHelper.getUIManager(it, UIManagerType.FABRIC) }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    uiManager?.addUIManagerEventListener(this)
  }

  override fun onDetachedFromWindow() {
    uiManager?.removeUIManagerEventListener(this)
    layoutAnimator.finish()
    super.onDetachedFromWindow()
  }

  override fun willMountItems(uiManager: UIManager) {
    didCapture = isAttachedToWindow && delegate?.containerShouldAnimateLayout() == true
    if (didCapture) layoutAnimator.capture()
  }

  override fun didMountItems(uiManager: UIManager) {
    val captured = didCapture
    didCapture = false
    val sizeChanged = width != reportedWidth || height != reportedHeight
    val spring = delegate?.containerLayoutSpring()

    if (!captured || spring == null) {
      layoutAnimator.discard()
      if (sizeChanged) {
        reportSize()
        delegate?.containerLayoutDidChange(animated = false)
      }
      return
    }

    val animated = layoutAnimator.animate(spring)
    if (!sizeChanged && !animated) return

    reportSize()
    delegate?.containerLayoutDidChange(animated = true)
  }

  override fun willDispatchViewUpdates(uiManager: UIManager) = Unit

  override fun didDispatchMountItems(uiManager: UIManager) = Unit

  override fun didScheduleMountItems(uiManager: UIManager) = Unit

  private fun reportSize() {
    reportedWidth = width
    reportedHeight = height
  }
}
