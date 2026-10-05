package com.morphlet.views

import android.content.Context
import android.view.ViewGroup

class MorphletStackLayer(context: Context) : ViewGroup(context) {

  var onLayoutChildren: (() -> Unit)? = null

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec), MeasureSpec.getSize(heightMeasureSpec))
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    onLayoutChildren?.invoke()
  }
}
