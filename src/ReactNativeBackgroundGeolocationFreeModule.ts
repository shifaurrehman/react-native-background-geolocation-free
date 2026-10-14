import { NativeModule, requireNativeModule } from 'expo';

import { ReactNativeBackgroundGeolocationFreeModuleEvents } from './ReactNativeBackgroundGeolocationFree.types';

declare class ReactNativeBackgroundGeolocationFreeModule extends NativeModule<ReactNativeBackgroundGeolocationFreeModuleEvents> {
  setValueAsync(value: string): Promise<void>;
}

export default requireNativeModule<ReactNativeBackgroundGeolocationFreeModule>('ReactNativeBackgroundGeolocationFree');
