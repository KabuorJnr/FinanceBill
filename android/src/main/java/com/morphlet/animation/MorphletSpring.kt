package com.morphlet.animation

import android.os.Handler
import android.os.Looper
import androidx.dynamicanimation.animation.FloatValueHolder
import androidx.dynamicanimation.animation.SpringAnimation

class MorphletSpring private constructor(
  private val animation: SpringAnimation,
  private val onUpdate: (Float) -> Unit,
) {
  private var pendingStart: Runnable? = null

  val isRunning: Boolean
    get() = animation.isRunning || pendingStart != null

  fun cancel() {
    pendingStart?.let { handler.removeCallbacks(it) }
    pendingStart = null
    if (animation.isRunning) {
      animation.cancel()
    }
  }

  private fun start(delayMillis: Long) {
    if (delayMillis <= 0) {
      animation.start()
      return
    }
    val start = Runnable {
      pendingStart = null
      animation.start()
    }
    pendingStart = start
    handler.postDelayed(start, delayMillis)
  }

  companion object {
    private const val SCALE = 1000f
    private val handler = Handler(Looper.getMainLooper())

    fun start(
      config: MorphletSpringConfig,
      velocity: Float = 0f,
      delayMillis: Long = 0,
      onUpdate: (Float) -> Unit,
      onEnd: ((Boolean) -> Unit)? = null,
    ): MorphletSpring {
      val animation = SpringAnimation(FloatValueHolder(0f))
        .setSpring(config.toSpringForce().setFinalPosition(SCALE))
        .setStartVelocity(velocity * SCALE)
      val spring = MorphletSpring(animation, onUpdate)
      animation.addUpdateListener { _, value, _ -> onUpdate(value / SCALE) }
      animation.addEndListener { _, canceled, _, _ ->
        if (!canceled) {
          spring.onUpdate(1f)
        }
        onEnd?.invoke(!canceled)
      }
      spring.start(delayMillis)
      return spring
    }

    fun lerp(from: Float, to: Float, progress: Float): Float = from + (to - from) * progress
  }
}
