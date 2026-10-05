package com.morphlet.controllers

import com.morphlet.animation.MorphletSpringConfig

object MorphletStack {
  private val presented = mutableListOf<MorphletController>()

  fun didPresent(controller: MorphletController) {
    presented.remove(controller)
    presented.add(controller)
  }

  fun push(controller: MorphletController, spring: MorphletSpringConfig) {
    val below = controllersBelow(controller)
    below.forEachIndexed { index, lower -> lower.applyStackDepth(index + 1, spring) }
    controller.didPushStack = below.isNotEmpty()
  }

  fun restore(controller: MorphletController, spring: MorphletSpringConfig) {
    if (!controller.didPushStack) return
    controller.didPushStack = false
    controllersBelow(controller).forEachIndexed { index, lower -> lower.applyStackDepth(index, spring) }
  }

  fun remove(controller: MorphletController) {
    presented.remove(controller)
  }

  private fun controllersBelow(controller: MorphletController): List<MorphletController> {
    val index = presented.indexOf(controller)
    val lower = if (index < 0) presented.toList() else presented.subList(0, index).toList()
    return lower.asReversed()
  }
}
