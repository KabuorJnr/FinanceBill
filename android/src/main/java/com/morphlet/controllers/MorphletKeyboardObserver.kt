package com.morphlet.controllers

import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MorphletKeyboardObserver(private val controller: MorphletController) {

  fun observe(view: View) {
    ViewCompat.setOnApplyWindowInsetsListener(view) { _, insets ->
      val keyboard = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom.toFloat()
      controller.keyboardDidChange(keyboard)
      controller.insetsDidChange()
      insets
    }
  }
}
