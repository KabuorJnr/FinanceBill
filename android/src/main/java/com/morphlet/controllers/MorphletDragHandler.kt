package com.morphlet.controllers

import android.view.MotionEvent
import android.view.VelocityTracker
import android.view.View
import android.view.ViewConfiguration
import android.view.ViewGroup
import com.morphlet.views.MorphletCardGestureHandler
import kotlin.math.abs

class MorphletDragHandler(private val controller: MorphletController) : MorphletCardGestureHandler {

  private var downX = 0f
  private var downY = 0f
  private var lastY = 0f
  private var isDragging = false
  private var scrollable: View? = null
  private var velocityTracker: VelocityTracker? = null

  override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
    val card = controller.windowView?.card ?: return false
    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        downX = event.x
        downY = event.y
        lastY = event.rawY
        isDragging = false
        scrollable = findVerticalScrollable(card, event.x, event.y)
        velocityTracker?.recycle()
        velocityTracker = VelocityTracker.obtain().apply { addMovement(event) }
      }
      MotionEvent.ACTION_MOVE -> {
        velocityTracker?.addMovement(event)
        if (!isDragging && shouldBeginDrag(card, event)) {
          isDragging = true
          lastY = event.rawY
          controller.beginDrag()
        } else if (!isDragging) {
          lastY = event.rawY
        }
      }
      MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> reset()
    }
    return isDragging
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    velocityTracker?.addMovement(event)
    when (event.actionMasked) {
      MotionEvent.ACTION_MOVE -> {
        if (!isDragging) return true
        controller.dragBy(event.rawY - lastY)
        lastY = event.rawY
      }
      MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
        if (isDragging) {
          val velocity = velocityTracker?.run {
            computeCurrentVelocity(1000)
            yVelocity
          } ?: 0f
          controller.endDrag(velocity, completed = event.actionMasked == MotionEvent.ACTION_UP)
        }
        reset()
      }
    }
    return true
  }

  private fun shouldBeginDrag(card: View, event: MotionEvent): Boolean {
    if (!controller.canDrag()) return false
    val dx = event.x - downX
    val dy = event.y - downY
    val touchSlop = ViewConfiguration.get(card.context).scaledTouchSlop
    if (abs(dy) < touchSlop || abs(dy) <= abs(dx)) return false

    val view = scrollable ?: return true
    val movingDown = event.rawY - lastY > 0f || dy > 0f
    return movingDown && !view.canScrollVertically(-1)
  }

  private fun findVerticalScrollable(root: View, x: Float, y: Float): View? {
    val hit = deepestViewAt(root, x, y) ?: return null
    var current: View? = hit
    while (current != null && current !== root) {
      if (current.canScrollVertically(1) || current.canScrollVertically(-1)) {
        return current
      }
      current = current.parent as? View
    }
    return null
  }

  private fun deepestViewAt(view: View, x: Float, y: Float): View? {
    if (x < 0 || y < 0 || x > view.width || y > view.height || view.visibility != View.VISIBLE) {
      return null
    }
    if (view is ViewGroup) {
      for (index in view.childCount - 1 downTo 0) {
        val child = view.getChildAt(index)
        val localX = x - child.left - child.translationX + view.scrollX
        val localY = y - child.top - child.translationY + view.scrollY
        deepestViewAt(child, localX, localY)?.let { return it }
      }
    }
    return view
  }

  private fun reset() {
    isDragging = false
    scrollable = null
    velocityTracker?.recycle()
    velocityTracker = null
  }
}
