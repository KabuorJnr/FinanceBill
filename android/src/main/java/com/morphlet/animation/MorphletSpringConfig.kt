package com.morphlet.animation

import androidx.dynamicanimation.animation.SpringForce
import com.facebook.react.bridge.ReadableMap
import kotlin.math.PI
import kotlin.math.max
import kotlin.math.pow
import kotlin.math.sqrt

data class MorphletSpringConfig(val mass: Float, val stiffness: Float, val damping: Float) {

  private val criticalDamping: Float
    get() = 2f * sqrt(stiffness * mass)

  fun withoutBounce(): MorphletSpringConfig = copy(damping = max(damping, criticalDamping))

  fun toSpringForce(): SpringForce =
    SpringForce()
      .setStiffness(stiffness / mass)
      .setDampingRatio(max(damping / criticalDamping, MINIMUM_DAMPING_RATIO))

  companion object {
    private const val MINIMUM_DAMPING_RATIO = 0.01f

    fun fromResponse(response: Float, dampingFraction: Float): MorphletSpringConfig {
      val period = max(response, 0.01f)
      return MorphletSpringConfig(
        mass = 1f,
        stiffness = (2f * PI.toFloat() / period).pow(2),
        damping = 4f * PI.toFloat() * dampingFraction / period,
      )
    }

    fun fromMap(map: ReadableMap?): MorphletSpringConfig? {
      if (map == null || !map.hasKey("stiffness")) {
        return null
      }
      val stiffness = map.getDouble("stiffness").toFloat()
      if (stiffness <= 0f) {
        return null
      }
      val mass = if (map.hasKey("mass")) map.getDouble("mass").toFloat() else 1f
      val damping = if (map.hasKey("damping")) map.getDouble("damping").toFloat() else 0f
      return MorphletSpringConfig(if (mass > 0f) mass else 1f, stiffness, max(damping, 0f))
    }
  }
}
