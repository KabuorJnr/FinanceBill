package com.morphlet.events

object MorphletEventName {
  const val WILL_PRESENT = "topWillPresent"
  const val DID_PRESENT = "topDidPresent"
  const val WILL_DISMISS = "topWillDismiss"
  const val DID_DISMISS = "topDidDismiss"
  const val INSETS_CHANGE = "topInsetsChange"

  private val REGISTRATION_NAMES =
    mapOf(
      WILL_PRESENT to "onWillPresent",
      DID_PRESENT to "onDidPresent",
      WILL_DISMISS to "onWillDismiss",
      DID_DISMISS to "onDidDismiss",
      INSETS_CHANGE to "onInsetsChange",
    )

  val directEventTypes: Map<String, Any> =
    REGISTRATION_NAMES.mapValues { (_, registrationName) -> mapOf("registrationName" to registrationName) }
}
