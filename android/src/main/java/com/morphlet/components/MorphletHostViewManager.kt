package com.morphlet.components

import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.MorphletHostViewManagerDelegate
import com.facebook.react.viewmanagers.MorphletHostViewManagerInterface
import com.morphlet.animation.MorphletSpringConfig
import com.morphlet.events.MorphletEventName

@ReactModule(name = MorphletHostViewManager.NAME)
class MorphletHostViewManager :
  ViewGroupManager<MorphletHostView>(),
  MorphletHostViewManagerInterface<MorphletHostView> {

  private val delegate = MorphletHostViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<MorphletHostView> = delegate

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): MorphletHostView = MorphletHostView(context)

  override fun addEventEmitters(reactContext: ThemedReactContext, view: MorphletHostView) {
    view.eventDispatcher = UIManagerHelper.getEventDispatcher(reactContext)
  }

  override fun onDropViewInstance(view: MorphletHostView) {
    super.onDropViewInstance(view)
    view.drop()
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> = MorphletEventName.directEventTypes

  override fun addView(parent: MorphletHostView, child: View, index: Int) {
    (child as? MorphletContainerView)?.let { parent.attachContent(it) }
  }

  override fun getChildCount(parent: MorphletHostView): Int = if (parent.content != null) 1 else 0

  override fun getChildAt(parent: MorphletHostView, index: Int): View? = parent.content

  override fun removeViewAt(parent: MorphletHostView, index: Int) {
    parent.detachContent()
  }

  override fun removeView(parent: MorphletHostView, view: View) {
    if (view === parent.content) parent.detachContent()
  }

  override fun setOpen(view: MorphletHostView, value: Boolean) {
    view.setOpen(value)
  }

  override fun setCardColor(view: MorphletHostView, value: Int?) {
    view.controller.cardColor = value
  }

  override fun setCornerRadius(view: MorphletHostView, value: Double) {
    view.controller.cornerRadius = value.toFloat()
  }

  override fun setCornerSmoothing(view: MorphletHostView, value: Double) {
    view.controller.cornerSmoothing = value.toFloat()
  }

  override fun setBottomOffset(view: MorphletHostView, value: Double) {
    view.controller.bottomOffset = value.toFloat()
  }

  override fun setBackdropColor(view: MorphletHostView, value: Int?) {
    view.controller.backdropColor = value
  }

  override fun setBackdropOpacity(view: MorphletHostView, value: Double) {
    view.controller.backdropOpacity = value.toFloat()
  }

  override fun setDismissible(view: MorphletHostView, value: Boolean) {
    view.controller.dismissible = value
  }

  override fun setDraggable(view: MorphletHostView, value: Boolean) {
    view.controller.draggable = value
  }

  override fun setFadeOnDrag(view: MorphletHostView, value: Boolean) {
    view.controller.fadesOnDrag = value
  }

  override fun setFullScreen(view: MorphletHostView, value: Boolean) {
    view.controller.fullScreen = value
  }

  override fun setStack(view: MorphletHostView, value: Boolean) {
    view.controller.stacked = value
  }

  override fun setOriginTag(view: MorphletHostView, value: Int) {
    view.originTag = value
  }

  override fun setDuration(view: MorphletHostView, value: Double) {
    view.duration = value.toFloat()
  }

  override fun setPresentSpring(view: MorphletHostView, value: ReadableMap?) {
    view.controller.presentSpring = MorphletSpringConfig.fromMap(value)
  }

  override fun setDismissSpring(view: MorphletHostView, value: ReadableMap?) {
    view.controller.dismissSpring = MorphletSpringConfig.fromMap(value)
  }

  override fun setMorphSpring(view: MorphletHostView, value: ReadableMap?) {
    view.controller.morphSpring = MorphletSpringConfig.fromMap(value)
  }

  override fun setLayoutSpring(view: MorphletHostView, value: ReadableMap?) {
    view.layoutSpring = MorphletSpringConfig.fromMap(value)
  }

  override fun setSnapSpring(view: MorphletHostView, value: ReadableMap?) {
    view.controller.snapSpring = MorphletSpringConfig.fromMap(value)
  }

  companion object {
    const val NAME = "MorphletHostView"
  }
}
