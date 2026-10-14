# React Native Background Geolocation Free

A free, MIT-licensed background location tracking library for React Native and Expo on Android and iOS. The module exposes a typed JavaScript API backed by Kotlin and Swift implementations through the Expo Modules API.

> **Implementation status:** This repository is version `0.1.0` and currently contains the Expo module scaffold. The API and architecture below describe the intended public contract and native design for the project. Native methods, services, permissions, and production type definitions are still being implemented.

## Features

- **Free and open source:** MIT licensed with no paid location provider dependency.
- **Battery optimized:** Android uses Google Play services' `FusedLocationProviderClient`; iOS uses `CLLocationManager` accuracy and distance filters.
- **Background execution:** Android uses a sticky foreground service with a persistent notification; iOS enables the location background mode.
- **Reboot survival:** Android listens for `BOOT_COMPLETED` and automatically restores tracking after restart.
- **TypeScript native:** Exports interfaces and typed promises for configuration, location payloads, permissions, and event subscriptions.
- **Cross-platform:** One JavaScript API for Android and iOS.

## Requirements

- React Native or Expo SDK project
- Expo Modules API
- Android device or emulator with Google Play services
- Xcode and an Apple device for iOS background-location testing

## Installation

Using npm:

```bash
npm install react-native-background-geolocation-free
```

Using Expo CLI:

```bash
npx expo install react-native-background-geolocation-free
```

For a React Native CLI project, rebuild the native apps after installation:

```bash
npx pod-install
npx react-native run-android
npx react-native run-ios
```

## Native setup

### Android

Add the required permissions and foreground-service declaration to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

<application>
  <service
    android:name=".BackgroundLocationService"
    android:foregroundServiceType="location"
    android:exported="false" />

  <receiver
    android:name=".BootCompletedReceiver"
    android:exported="false">
    <intent-filter>
      <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
  </receiver>
</application>
```

If your application targets Android 14 (API 34) or later, the system enforces `FOREGROUND_SERVICE_LOCATION`. Android 13+ also requires runtime notification permission before the foreground-service notification can appear.

### iOS

Add the location usage descriptions to `ios/<your-app>/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app uses your location to record trips while the app is open.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app uses your location to continue recording trips while it is in the background.</string>
```

Enable **Location updates** under **Signing & Capabilities → Background Modes**. The native module also sets:

- `allowsBackgroundLocationUpdates = true`
- `showsBackgroundLocationIndicator = true`

## Basic usage

```tsx
import React, { useEffect, useRef } from 'react';
import { Button, Text, View } from 'react-native';
import BackgroundGeolocation, {
  LocationConfig,
  LocationData,
  Subscription,
} from 'react-native-background-geolocation-free';

export default function App() {
  const subscription = useRef<Subscription | null>(null);

  useEffect(() => {
    subscription.current = BackgroundGeolocation.addLocationListener((location) => {
      console.log('New location', location);
    });

    return () => {
      subscription.current?.remove();
      BackgroundGeolocation.stopLocationTracking().catch(console.error);
    };
  }, []);

  const start = async () => {
    const config: LocationConfig = {
      accuracy: 'high',
      distanceFilter: 10,
      interval: 5000,
      notificationTitle: 'Location tracking active',
      notificationText: 'Recording your location in the background.',
    };

    try {
      await BackgroundGeolocation.startLocationTracking(config);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Start tracking" onPress={start} />
      <Button
        title="Stop tracking"
        onPress={() => BackgroundGeolocation.stopLocationTracking()}
      />
    </View>
  );
}
```

## API summary

- `startLocationTracking(config?: LocationConfig): Promise<void>` — requests native location access, configures native providers, and starts background tracking.
- `stopLocationTracking(): Promise<void>` — stops updates and removes the Android foreground service.
- `addLocationListener(listener: (location: LocationData) => void): Subscription` — subscribes to realtime location events.

See [API.md](./API.md) for complete parameter, return, permission, and error details.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the JavaScript bridge, Android foreground-service lifecycle, iOS background execution, and native-to-JS event flow.

## Contributing

Issues and pull requests are welcome. Platform-specific reproduction details are especially helpful. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT © [Shifa Ur Rehman](https://github.com/shifaurrehman). See [LICENSE](./LICENSE).
