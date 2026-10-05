package com.morphlet.views

import android.content.Context
import android.view.View
import android.widget.FrameLayout

class MorphletWindowView(context: Context) : FrameLayout(context) {

  val backdrop = View(context)
  val stackLayer = MorphletStackLayer(context)
  val card = MorphletSquircleView(context)

  init {
    clipChildren = false
    stackLayer.clipChildren = false
    addView(backdrop, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    addView(stackLayer, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    stackLayer.addView(card)
  }
}
