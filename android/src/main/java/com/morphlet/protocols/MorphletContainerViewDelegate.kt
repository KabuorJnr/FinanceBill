package com.morphlet.protocols

import com.morphlet.animation.MorphletSpringConfig

interface MorphletContainerViewDelegate {
  fun containerShouldAnimateLayout(): Boolean

  fun containerLayoutSpring(): MorphletSpringConfig

  fun containerLayoutDidChange(animated: Boolean)
}
