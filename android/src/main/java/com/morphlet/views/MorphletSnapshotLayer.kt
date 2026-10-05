package com.morphlet.views

import android.graphics.Canvas
import android.graphics.Picture
import android.graphics.RectF

class MorphletSnapshotLayer(private val picture: Picture, val bounds: RectF) {
  var alpha = 1f
  var translationX = 0f
  var translationY = 0f
  var scale = 1f

  fun draw(canvas: Canvas) {
    if (alpha <= 0f) {
      return
    }
    val saveCount = canvas.save()
    canvas.translate(bounds.left + translationX, bounds.top + translationY)
    canvas.scale(scale, scale, bounds.width() / 2, bounds.height() / 2)
    canvas.saveLayerAlpha(0f, 0f, bounds.width(), bounds.height(), (alpha.coerceIn(0f, 1f) * 255).toInt())
    canvas.drawPicture(picture)
    canvas.restoreToCount(saveCount)
  }
}
