# Architecture

## Overview

The module follows the standard three-layer Expo native-module structure:

1. **JavaScript/TypeScript API:** validates intent at the call site, exposes typed promises, and manages event subscriptions.
2. **Expo Modules bridge:** maps named `AsyncFunction` calls to Kotlin and Swift methods and serializes payloads between JavaScript and native runtimes.
3. **Platform implementations:** Android tracks with a foreground service and Fused Location Provider; iOS tracks with `CLLocationManager`.

```text
React component
  │ addLocationListener / startLocationTracking / stopLocationTracking
  ▼
TypeScript NativeModule wrapper (Expo)
  │ Expo Modules bridge
  ├─────────────────────┬─────────────────────┐
  ▼                     ▼
Kotlin module       Swift module
  │ foreground service   │ CLLocationManager delegate
  │ Fused Location       │ background location capability
  └─────────┬───────────┘
            │ sendEvent
            ▼
       JS event emitter
            │
            ▼
       Registered listeners
```

## JavaScript and native bridge

### TypeScript layer

The public TypeScript module imports an `expo` `NativeModule` and calls `requireNativeModule('ReactNativeBackgroundGeolocationFree')`. Calls are declared as asynchronous methods, so JavaScript remains non-blocking while the native side checks permissions, configures providers, and changes service state.

The native module declares an `onChange`-style event map. For the target public API, native location payloads are emitted through the module event channel and dispatched to subscriptions created by `addLocationListener`.

### Expo Modules API

The Android Kotlin module and iOS Swift module each provide a `ModuleDefinition` with:

- A stable `Name("ReactNativeBackgroundGeolocationFree")`
- Event channel declarations
- `AsyncFunction` implementations for start, stop, configuration, and permission operations
- `sendEvent` calls containing dictionary payloads

Expo converts Kotlin/Swift values to JSON-compatible JavaScript values. Location coordinates, accuracy, speed, and timestamps use numeric values, and configuration fields use primitive values to keep serialization predictable.

## Android lifecycle

### Start flow

1. JavaScript calls `startLocationTracking(config)`.
2. Kotlin verifies fine/background location permission and notification access where required.
3. The module creates or updates a low-importance notification channel.
4. It builds the persistent foreground notification from `notificationTitle` and `notificationText`.
5. It starts `BackgroundLocationService` with `foregroundServiceType="location"`.
6. The service promotes itself with `startForeground`, making it sticky and visible to the user.
7. The service configures `FusedLocationProviderClient` using accuracy, distance filter, and interval settings.

### Runtime behavior

- The service remains alive while the app is backgrounded because it is a foreground service.
- The Fused provider batches or throttles updates according to the supplied interval and distance filter.
- Every accepted update is converted to a location dictionary and sent to JavaScript through the Expo event bridge.
- Service stop removes location callbacks and calls `stopForeground` followed by `stopSelf`.

### Notification channels

The module creates a dedicated notification channel so users can identify and control tracking notifications independently. The persistent notification is required by Android while a foreground service runs and should clearly state that location tracking is active.

### Boot restoration

A `BroadcastReceiver` listens for `BOOT_COMPLETED`. If tracking was active before shutdown, the receiver:

1. Reads the persisted tracking configuration.
2. Verifies all required permissions remain granted.
3. Starts the location foreground service with the saved configuration.

This flow allows tracking to resume without user interaction after a device reboot. OEM-specific power management can still delay or restrict delivery; see `CONTRIBUTING.md` for reporting guidance.

## iOS execution flow

### Start flow

1. JavaScript calls `startLocationTracking(config)`.
2. Swift requests `whenInUse` authorization first, then `always` authorization for background tracking.
3. The module verifies that the Location Updates background mode is enabled.
4. It configures `CLLocationManager`:
   - `desiredAccuracy`
   - `distanceFilter`
   - `allowsBackgroundLocationUpdates = true`
   - `showsBackgroundLocationIndicator = true`
5. It calls `startUpdatingLocation()`.

### Moving and stationary states

iOS automatically pauses location delivery when it determines the device is stationary and resumes updates when movement is detected. Native accuracy and distance-filter tuning reduces battery drain by avoiding unnecessary GPS wakeups while preserving reliable trip recording.

### Stop and authorization changes

`stopLocationTracking()` calls `stopUpdatingLocation()` and clears native listener state. If the user revokes authorization while the app runs, the location manager delegate emits a permission-change event so JavaScript can stop dependent workflows and surface actionable UI.

## Event emission flow

1. A native provider produces a location on its platform callback thread.
2. Kotlin or Swift converts it into a stable dictionary matching `LocationData`.
3. The Expo module calls `sendEvent` with that dictionary.
4. Expo marshals the event to the JavaScript runtime.
5. The typed JavaScript wrapper invokes every active listener.
6. Each listener may remove itself through its returned `Subscription`.

Native code never blocks the provider callback solely waiting for JavaScript to acknowledge delivery. Events are forwarded and the callback returns, preventing slow application code from stalling location updates.

## State ownership

Android owns durable tracking state because the foreground service and boot receiver must survive process restarts. iOS owns authorization and location-manager state because those objects are tied to the app lifecycle. The JavaScript wrapper remains stateless except for active subscriptions, which makes reloading and reattachment safer during development.
