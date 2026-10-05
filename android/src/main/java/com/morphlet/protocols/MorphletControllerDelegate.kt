package com.morphlet.protocols

interface MorphletControllerDelegate {
  fun controllerWillPresent()

  fun controllerDidPresent()

  fun controllerWillDismiss(interactive: Boolean)

  fun controllerDidDismiss()

  fun controllerInsetsDidChange()
}
