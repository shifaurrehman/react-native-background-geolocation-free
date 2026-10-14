import { registerWebModule, NativeModule } from 'expo';

import { ReactNativeBackgroundGeolocationFreeModuleEvents } from './ReactNativeBackgroundGeolocationFree.types';

// ReactNativeBackgroundGeolocationFreeModule is not available on the web platform.
class ReactNativeBackgroundGeolocationFreeModule extends NativeModule<ReactNativeBackgroundGeolocationFreeModuleEvents> {}

export default registerWebModule(ReactNativeBackgroundGeolocationFreeModule, 'ReactNativeBackgroundGeolocationFreeModule');
