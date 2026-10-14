import ExpoModulesCore

public class ReactNativeBackgroundGeolocationFreeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ReactNativeBackgroundGeolocationFree")

    Events("onChange")

    AsyncFunction("setValueAsync") { (value: String) in
      self.sendEvent("onChange", [
        "value": value
      ])
    }
  }
}
