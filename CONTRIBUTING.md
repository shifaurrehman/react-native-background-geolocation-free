# Contributing

Thanks for helping improve this project. Please keep changes focused and include enough platform information to reproduce native behavior.

## Local setup

Requirements:

- Node.js LTS
- npm
- JDK and Android Studio
- Xcode, CocoaPods, and an Apple developer environment

Install and prepare the module:

```bash
npm install
npm run prepare
```

Run the example app:

```bash
cd example
npm install
npx expo start
```

Open native workspaces:

```bash
npm run open:android
npm run open:ios
```

Run checks from the repository root:

```bash
npm run lint
npm test
npm run build
```

iOS dependency installation may require:

```bash
cd example/ios
pod install
```

## Opening issues

Include the following information:

- Module version and installation method
- React Native or Expo SDK version
- Android API level or iOS version
- Device model, especially for OEM-specific behavior
- Full native and JavaScript error logs
- Minimal code sample
- Whether the app is debug, development, or release build

### Background-location reports

Background behavior varies widely between OS versions and manufacturers. Also include:

- Whether the foreground notification was visible
- Battery optimization and Doze settings
- Exact elapsed time until tracking stopped
- Whether the app had Always/background location permission
- Whether location services or notifications were later disabled
- Whether the issue reproduces after reboot

For Samsung, Xiaomi, Huawei, OnePlus, and other OEM reports, mention the manufacturer's battery saver, autostart, and app-lock settings. These systems frequently defer or terminate services despite standard Android permissions.

## Pull requests

1. Fork and create a focused branch.
2. Add or update tests for public behavior where practical.
3. Run `npm run lint`, `npm test`, and `npm run build`.
4. Test real Android and iOS devices; emulators cannot validate complete background lifecycle behavior.
5. Keep public TypeScript APIs backward compatible or clearly document breaking changes.
6. Describe user-visible changes and migration steps in the PR description.

## Code style

### TypeScript

- Use strict, explicit types for public APIs.
- Export interfaces and union types from `src/`.
- Keep JavaScript wrappers stateless except for listener management.
- Prefer `async`/`await` over nested Promise chains.
- Do not suppress type errors.

### Kotlin

- Follow Android and Kotlin idiomatic formatting.
- Keep service and module responsibilities separated.
- Avoid blocking calls on the main thread.
- Use structured concurrency and cancel work when tracking stops.
- Clearly scope notification-channel and boot-receiver side effects.

### Swift

- Follow Swift API design conventions.
- Keep `CLLocationManagerDelegate` state explicit and predictable.
- Avoid retain cycles in delegates and callbacks.
- Dispatch UI-sensitive outcomes to the appropriate queue only when required.
- Handle authorization changes as first-class behavior.

### Documentation

Update `README.md` and `API.md` whenever adding, renaming, or changing public options, defaults, permissions, return types, or emitted payloads. Document new error codes in `API.md`.
