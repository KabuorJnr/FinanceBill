package com.morphlet.views

import android.annotation.SuppressLint
import android.view.MotionEvent
import android.view.View
import com.facebook.react.uimanager.JSTouchDispatcher
import com.facebook.react.uimanager.RootView
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.EventDispatcher
import com.facebook.react.views.view.ReactViewGroup

@SuppressLint("ViewConstructor")
class MorphletTouchRootView(private val reactContext: ThemedReactContext) :
  ReactViewGroup(reactContext),
  RootView {

  var eventDispatcher: EventDispatcher? = null

  private val touchDispatcher = JSTouchDispatcher(this)

  override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
    eventDispatcher?.let { touchDispatcher.handleTouchEvent(event, it, reactContext) }
    return super.onInterceptTouchEvent(event)
  }

  @SuppressLint("ClickableViewAccessibility")
  override fun onTouchEvent(event: MotionEvent): Boolean {
    eventDispatcher?.let { touchDispatcher.handleTouchEvent(event, it, reactContext) }
    super.onTouchEvent(event)
    return true
  }

  override fun onChildStartedNativeGesture(childView: View?, ev: MotionEvent) {
    eventDispatcher?.let { touchDispatcher.onChildStartedNativeGesture(ev, it) }
  }

  override fun onChildEndedNativeGesture(childView: View, ev: MotionEvent) {
    eventDispatcher?.let { touchDispatcher.onChildEndedNativeGesture(ev, it) }
  }

  override fun handleException(t: Throwable) {
    reactContext.reactApplicationContext.handleException(RuntimeException(t))
  }

  override fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) = Unit
}
