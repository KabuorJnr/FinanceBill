package com.morphlet.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

class MorphletEvent(
  surfaceId: Int,
  viewTag: Int,
  private val name: String,
  private val data: WritableMap? = null,
) : Event<MorphletEvent>(surfaceId, viewTag) {

  override fun getEventName(): String = name

  override fun getEventData(): WritableMap = data ?: Arguments.createMap()
}
