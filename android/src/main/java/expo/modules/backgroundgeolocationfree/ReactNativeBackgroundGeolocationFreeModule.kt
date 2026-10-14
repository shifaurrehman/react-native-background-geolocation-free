package expo.modules.backgroundgeolocationfree

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ReactNativeBackgroundGeolocationFreeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ReactNativeBackgroundGeolocationFree")

    Events("onChange")

    AsyncFunction("setValueAsync") { value: String ->
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }
  }
}
