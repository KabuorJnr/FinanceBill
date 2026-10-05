package com.morphlet.components

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager

@ReactModule(name = MorphletContainerViewManager.NAME)
class MorphletContainerViewManager : ReactViewManager() {

  override fun getName(): String = NAME

  override fun createViewInstance(context: ThemedReactContext): ReactViewGroup = MorphletContainerView(context)

  companion object {
    const val NAME = "MorphletContainerView"
  }
}
