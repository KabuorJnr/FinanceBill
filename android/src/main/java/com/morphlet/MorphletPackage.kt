package com.morphlet

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.morphlet.components.MorphletContainerViewManager
import com.morphlet.components.MorphletHostViewManager
import com.morphlet.components.MorphletSwitchViewManager

class MorphletPackage : BaseReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? = null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider { emptyMap() }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    listOf(MorphletHostViewManager(), MorphletContainerViewManager(), MorphletSwitchViewManager())
}
