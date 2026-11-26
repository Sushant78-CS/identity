let externalActivityInProgress = false;
let suppressAppLockUntil = 0;

export const beginExternalActivity = () => {
  externalActivityInProgress = true;
};

export const endExternalActivity = () => {
  externalActivityInProgress = false;

  // Allow Android time to finish returning from the native share sheet.
  suppressAppLockUntil = Date.now() + 2000;
};

export const shouldSuppressAppLock = () => {
  return externalActivityInProgress || Date.now() < suppressAppLockUntil;
};
