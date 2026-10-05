package com.morphlet.device

import android.os.Build
import android.view.RoundedCorner
import android.view.View

object MorphletDisplayCorners {
  private val CORNER_POSITIONS =
    listOf(
      RoundedCorner.POSITION_TOP_LEFT,
      RoundedCorner.POSITION_TOP_RIGHT,
      RoundedCorner.POSITION_BOTTOM_LEFT,
      RoundedCorner.POSITION_BOTTOM_RIGHT,
    )

  fun radius(view: View): Float {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return 0f
    }
    val insets = view.rootWindowInsets ?: return 0f
    return CORNER_POSITIONS
      .mapNotNull { position -> insets.getRoundedCorner(position)?.radius }
      .minOrNull()
      ?.toFloat() ?: 0f
  }
}
