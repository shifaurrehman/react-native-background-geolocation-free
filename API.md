# API Reference

All native calls are asynchronous and return Promises. Unless stated otherwise, public identifiers are re-exported from the package root.

```ts
import BackgroundGeolocation, {
  LocationConfig,
  LocationData,
  PermissionStatus,
  Subscription,
} from 'react-native-background-geolocation-free';
```

## Interfaces and types

### `LocationConfig`

Optional tracking and notification configuration.

```ts
export interface LocationConfig {
  /**
   * Desired location accuracy.
   * @default 'balanced'
   */
  accuracy?: 'balanced' | 'high';

  /**
   * Minimum distance, in meters, between emitted locations.
   * @default 10
   */
  distanceFilter?: number;

  /**
   * Preferred update interval, in milliseconds. Android primarily applies
   * this value; iOS derives timing from accuracy and movement.
   * @default 5000
   */
  interval?: number;

  /**
   * Android foreground-service notification title.
   * @default 'Background location'
   */
  notificationTitle?: string;

  /**
   * Android foreground-service notification message.
   * @default 'Location tracking is active'
   */
  notificationText?: string;
}
```

### `LocationData`

Payload emitted for every accepted location update.

```ts
export interface LocationData {
  /** Latitude in decimal degrees. */
  latitude: number;

  /** Longitude in decimal degrees. */
  longitude: number;

  /** Height above sea level, in meters, when available. */
  altitude: number | null;

  /** Radius of location uncertainty, in meters. Lower is better. */
  accuracy: number;

  /** Ground speed, in meters per second, when available. */
  speed: number | null;

  /**
   * Location timestamp in milliseconds since the Unix epoch.
   */
  timestamp: number;
}
```

### `Subscription`

Handle returned by an event-listener registration.

```ts
export interface Subscription {
  /** Removes this listener. Safe to call more than once. */
  remove(): void;
}
```

### `PermissionStatus`

Normalized across Android and iOS.

```ts
export type PermissionStatus =
  | 'granted'
  | 'grantedWhenInUse'
  | 'denied'
  | 'blocked'
  | 'undetermined';
```

## Functions

### `startLocationTracking`

```ts
startLocationTracking(config?: LocationConfig): Promise<void>;
```

Requests the required native permissions, configures the location provider, and starts background tracking.

- **Parameters:** `config` — optional location and notification settings.
- **Resolves:** when native tracking has started.
- **Rejects:** with `LocationPermissionDeniedError`, `LocationPermissionBlockedError`, `LocationServicesDisabledError`, `NotificationPermissionDeniedError`, `InvalidConfigError`, or a platform-native error.
- **Behavior:** If tracking is already active, native code replaces the current configuration without creating a duplicate service or manager session.

### `stopLocationTracking`

```ts
stopLocationTracking(): Promise<void>;
```

Stops native location updates, clears pending callback state, and removes the Android foreground service.

- **Parameters:** none.
- **Resolves:** when tracking is fully stopped.
- **Rejects:** with `TrackingNotActiveError` when no tracking session exists, or a platform-native error.
- **Idempotence target:** implementations should tolerate duplicate stop calls, but callers should still handle rejection defensively.

### `addLocationListener`

```ts
addLocationListener(
  listener: (location: LocationData) => void
): Subscription;
```

Registers a listener for realtime native location events.

- **Parameters:** `listener` — callback invoked on the JavaScript thread for each location update.
- **Returns:** a `Subscription` with a `remove()` method.
- **Exceptions:** throws synchronously if `listener` is not a function.

```ts
const subscription = BackgroundGeolocation.addLocationListener((location) => {
  console.log(location.latitude, location.longitude, location.accuracy);
});

subscription.remove();
```

### `getLocationPermissionStatus`

```ts
getLocationPermissionStatus(): Promise<PermissionStatus>;
```

Returns the current normalized location permission state without requesting access.

### `requestLocationPermissions`

```ts
requestLocationPermissions(background: boolean): Promise<PermissionStatus>;
```

Requests location authorization.

- **Parameters:** `background` — when `true`, requests background/Always authorization in addition to When-in-use access.
- **Returns:** the resulting normalized `PermissionStatus`.

## Defaults

| Config field | Default | Notes |
| --- | ---: | --- |
| `accuracy` | `'balanced'` | `'high'` favors GPS and higher battery use |
| `distanceFilter` | `10` meters | `0` may produce very frequent updates |
| `interval` | `5000` ms | Primary Android update cadence |
| `notificationTitle` | `'Background location'` | Android persistent notification |
| `notificationText` | `'Location tracking is active'` | Android persistent notification |

## Error handling

Promises reject with an `Error` whose `message` contains a stable code prefix. Use these documented codes rather than parsing platform-specific strings.

| Code | Platform | Meaning |
| --- | --- | --- |
| `E_LOCATION_PERMISSION_DENIED` | Both | User declined location authorization |
| `E_LOCATION_PERMISSION_BLOCKED` | Both | Authorization must be changed in OS settings |
| `E_BACKGROUND_PERMISSION_DENIED` | Both | Foreground/When-in-use granted, background/Always denied |
| `E_LOCATION_SERVICES_DISABLED` | Both | Device location services are off |
| `E_NOTIFICATION_PERMISSION_DENIED` | Android 13+ | Notification permission denied |
| `E_TRACKING_NOT_ACTIVE` | Both | Stop requested while no session is active |
| `E_INVALID_CONFIG` | Both | Numeric value invalid or non-finite |
| `E_NATIVE_ERROR` | Both | Unexpected platform-native failure |

```ts
try {
  await BackgroundGeolocation.startLocationTracking({ accuracy: 'high' });
} catch (error) {
  if (error instanceof Error && error.message.includes('E_LOCATION_PERMISSION_DENIED')) {
    // Show permission explanation UI.
  }
}
```

## Platform differences

- Android exposes tracking through a sticky location foreground service and restores it after reboot.
- Android requires `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE_LOCATION`, and `POST_NOTIFICATIONS` where applicable.
- iOS requires usage-description plist keys and the **Location updates** background mode.
- iOS may pause updates automatically while the device is stationary.
- The web target does not implement location tracking.
