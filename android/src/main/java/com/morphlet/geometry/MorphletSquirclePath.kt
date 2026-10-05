package com.morphlet.geometry

import android.graphics.Path
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt
import kotlin.math.tan

object MorphletSquirclePath {
  private const val CORNER_POINT_COUNT = 10
  private const val CONTINUOUS_CORNER_EXTENT = 1.52866483f
  private val HALF_PI = (PI / 2).toFloat()
  private val QUARTER_PI = (PI / 4).toFloat()
  private val SQRT_TWO = sqrt(2f)

  fun build(
    path: Path,
    width: Float,
    height: Float,
    cornerRadius: Float,
    smoothing: Float,
    displayCurve: Float,
  ): Path {
    val w = max(width, 0.01f)
    val h = max(height, 0.01f)
    val budget = min(w, h) / 2
    val radius = max(min(cornerRadius, budget), 0.001f)
    val blend = displayCurve.coerceIn(0f, 1f)

    val smoothed = smoothedCorner(radius, smoothing, budget)
    val continuous = continuousCorner(radius, budget)
    val shape = FloatArray(CORNER_POINT_COUNT * 2) { index ->
      smoothed[index] + (continuous[index] - smoothed[index]) * blend
    }

    path.reset()
    addCorner(path, shape, w, 0f, 1f, 0f, 0f, 1f, moveToStart = true)
    addCorner(path, shape, w, h, 0f, 1f, -1f, 0f, moveToStart = false)
    addCorner(path, shape, 0f, h, -1f, 0f, 0f, -1f, moveToStart = false)
    addCorner(path, shape, 0f, 0f, 0f, -1f, 1f, 0f, moveToStart = false)
    path.close()
    return path
  }

  private fun smoothedCorner(radius: Float, cornerSmoothing: Float, budget: Float): FloatArray {
    val p = min((1 + cornerSmoothing) * radius, budget)
    val smoothing = max(0f, min(cornerSmoothing, budget / radius - 1))

    val arcMeasure = HALF_PI * (1 - smoothing)
    val arcLength = sin(arcMeasure / 2) * radius * SQRT_TWO
    val alpha = (HALF_PI - arcMeasure) / 2
    val p3ToP4 = radius * tan(alpha / 2)
    val beta = QUARTER_PI * smoothing
    val c = p3ToP4 * cos(beta)
    val d = c * tan(beta)
    val b = (p - arcLength - c - d) / 3
    val a = 2 * b

    val sx = -p
    val ax = sx + a + b + c
    val ay = d
    val bx = ax + arcLength
    val by = ay + arcLength
    val k = (4f / 3f) * tan(arcMeasure / 4) * radius
    val ta = alpha
    val tb = HALF_PI - alpha

    return floatArrayOf(
      sx, 0f,
      sx + a, 0f,
      sx + a + b, 0f,
      ax, ay,
      ax + k * cos(ta), ay + k * sin(ta),
      bx - k * cos(tb), by - k * sin(tb),
      bx, by,
      bx + d, by + c,
      bx + d, by + b + c,
      bx + d, by + a + b + c,
    )
  }

  private fun continuousCorner(radius: Float, budget: Float): FloatArray {
    val r = min(radius, budget / CONTINUOUS_CORNER_EXTENT)
    return floatArrayOf(
      -CONTINUOUS_CORNER_EXTENT * r, 0f,
      -1.08849323f * r, 0f,
      -0.86840689f * r, 0f,
      -0.63149399f * r, 0.07491100f * r,
      -0.37282392f * r, 0.16906013f * r,
      -0.16906013f * r, 0.37282392f * r,
      -0.07491100f * r, 0.63149399f * r,
      0f, 0.86840689f * r,
      0f, 1.08849323f * r,
      0f, CONTINUOUS_CORNER_EXTENT * r,
    )
  }

  private fun addCorner(
    path: Path,
    shape: FloatArray,
    cornerX: Float,
    cornerY: Float,
    e1x: Float,
    e1y: Float,
    e2x: Float,
    e2y: Float,
    moveToStart: Boolean,
  ) {
    fun x(index: Int) = cornerX + e1x * shape[index * 2] + e2x * shape[index * 2 + 1]
    fun y(index: Int) = cornerY + e1y * shape[index * 2] + e2y * shape[index * 2 + 1]

    if (moveToStart) {
      path.moveTo(x(0), y(0))
    } else {
      path.lineTo(x(0), y(0))
    }
    path.cubicTo(x(1), y(1), x(2), y(2), x(3), y(3))
    path.cubicTo(x(4), y(4), x(5), y(5), x(6), y(6))
    path.cubicTo(x(7), y(7), x(8), y(8), x(9), y(9))
  }
}
