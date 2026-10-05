package com.morphlet.views

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Picture
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import com.morphlet.geometry.MorphletSquirclePath

interface MorphletCardGestureHandler {
  fun onInterceptTouchEvent(event: MotionEvent): Boolean

  fun onTouchEvent(event: MotionEvent): Boolean
}

class MorphletSquircleView(context: Context) : ViewGroup(context) {

  var cornerRadius = 0f
    set(value) {
      field = value
      invalidatePath()
    }

  var cornerSmoothing = 0.6f
    set(value) {
      field = value.coerceIn(0f, 1f)
      invalidatePath()
    }

  var cardColor = Color.WHITE
    set(value) {
      field = value
      invalidate()
    }

  var coverColor = Color.TRANSPARENT
    set(value) {
      field = value
      invalidate()
    }

  var coverAlpha = 0f
    set(value) {
      field = value
      invalidate()
    }

  var snapshot: Picture? = null
    set(value) {
      field = value
      invalidate()
    }

  var snapshotAlpha = 0f
    set(value) {
      field = value
      invalidate()
    }

  var content: View? = null
    set(value) {
      field?.let { removeView(it) }
      field = value
      value?.let { addView(it) }
    }

  var contentWidth = 0
  var contentHeight = 0
  var gestureHandler: MorphletCardGestureHandler? = null

  private val path = Path()
  private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
  private var pathWidth = -1
  private var pathHeight = -1

  init {
    isClickable = true
    clipChildren = false
    setWillNotDraw(false)
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec), MeasureSpec.getSize(heightMeasureSpec))
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    val view = content ?: return
    view.measure(
      MeasureSpec.makeMeasureSpec(contentWidth, MeasureSpec.EXACTLY),
      MeasureSpec.makeMeasureSpec(contentHeight, MeasureSpec.EXACTLY),
    )
    view.layout(0, 0, contentWidth, contentHeight)
  }

  override fun dispatchDraw(canvas: Canvas) {
    updatePath()

    paint.color = cardColor
    canvas.drawPath(path, paint)

    val saveCount = canvas.save()
    canvas.clipPath(path)
    super.dispatchDraw(canvas)

    if (coverAlpha > 0f) {
      paint.color = coverColor
      paint.alpha = (Color.alpha(coverColor) * coverAlpha.coerceIn(0f, 1f)).toInt()
      canvas.drawPath(path, paint)
    }

    val picture = snapshot
    if (picture != null && snapshotAlpha > 0f) {
      val left = (width - picture.width) / 2f
      val top = (height - picture.height).toFloat()
      canvas.saveLayerAlpha(
        left,
        top,
        left + picture.width,
        top + picture.height,
        (snapshotAlpha.coerceIn(0f, 1f) * 255).toInt(),
      )
      canvas.translate(left, top)
      canvas.drawPicture(picture)
      canvas.restore()
    }

    canvas.restoreToCount(saveCount)
  }

  @SuppressLint("ClickableViewAccessibility")
  override fun onInterceptTouchEvent(event: MotionEvent): Boolean =
    gestureHandler?.onInterceptTouchEvent(event) ?: false

  @SuppressLint("ClickableViewAccessibility")
  override fun onTouchEvent(event: MotionEvent): Boolean {
    gestureHandler?.onTouchEvent(event)
    return true
  }

  private fun invalidatePath() {
    pathWidth = -1
    invalidate()
  }

  private fun updatePath() {
    if (pathWidth == width && pathHeight == height) {
      return
    }
    pathWidth = width
    pathHeight = height
    MorphletSquirclePath.build(
      path,
      width.toFloat(),
      height.toFloat(),
      cornerRadius,
      cornerSmoothing,
      0f,
    )
  }
}
