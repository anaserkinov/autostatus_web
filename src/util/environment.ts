export const IS_ANDROID = /Android/i.test(navigator.userAgent);
export const IS_IOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
export const IS_MAC_OS = /Mac OS X/i.test(navigator.userAgent);
export const IS_WINDOWS = /Win/i.test(navigator.userAgent);
export const IS_LINUX = /Linux/i.test(navigator.userAgent);

export const IS_MOBILE = IS_ANDROID || IS_IOS;
export const IS_DESKTOP = !IS_MOBILE;

export const PLATFORM = IS_ANDROID ? 'android'
  : IS_IOS ? 'ios'
  : IS_MAC_OS ? 'macos'
  : IS_WINDOWS ? 'windows'
  : IS_LINUX ? 'linux'
  : 'unknown';
