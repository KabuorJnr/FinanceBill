package com.morphlet.components

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager
import com.morphlet.animation.MorphletSpringConfig

@ReactModule(name = MorphletSwitchViewManager.NAME)
class MorphletSwitchViewManager : ReactViewManager() {

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): ReactViewGroup = MorphletSwitchView(context)

  @ReactProp(name = "transition")
  fun setTransition(view: ReactViewGroup, value: String?) {
    (view as MorphletSwitchView).transition = value ?: MorphletSwitchView.TRANSITION_MORPH
  }

  @ReactProp(name = "direction")
  fun setDirection(view: ReactViewGroup, value: String?) {
    (view as MorphletSwitchView).direction = value ?: MorphletSwitchView.DIRECTION_FORWARD
  }

  @ReactProp(name = "duration", defaultFloat = 0.25f)
  fun setDuration(view: ReactViewGroup, value: Float) {
    (view as MorphletSwitchView).duration = value
  }

  @ReactProp(name = "spring")
  fun setSpring(view: ReactViewGroup, value: ReadableMap?) {
    (view as MorphletSwitchView).spring = MorphletSpringConfig.fromMap(value)
  }

  companion object {
    const val NAME = "MorphletSwitchView"
  }
}
