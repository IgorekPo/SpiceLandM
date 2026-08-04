const subscribers = new Set();
let listening = false;
let frame = 0;
let latestTilt = { x: 0, y: 0 };
const TILT_SMOOTHING = 0.16;

export const supportsDeviceTilt = () => typeof window.DeviceOrientationEvent !== 'undefined';

export const deviceTiltNeedsPermission = () => supportsDeviceTilt()
  && typeof window.DeviceOrientationEvent.requestPermission === 'function';

const clamp = (value) => Math.max(-1, Math.min(1, value));

const publishTilt = () => {
  frame = 0;
  subscribers.forEach((subscriber) => subscriber(latestTilt));
};

const handleOrientation = (event) => {
  const nextTilt = {
    x: clamp((event.gamma || 0) / 35),
    y: clamp(((event.beta || 45) - 45) / 35),
  };
  latestTilt = {
    x: latestTilt.x + ((nextTilt.x - latestTilt.x) * TILT_SMOOTHING),
    y: latestTilt.y + ((nextTilt.y - latestTilt.y) * TILT_SMOOTHING),
  };
  if (!frame) frame = window.requestAnimationFrame(publishTilt);
};

const startListening = () => {
  if (listening || !supportsDeviceTilt()) return;
  listening = true;
  window.addEventListener('deviceorientation', handleOrientation, { passive: true });
};

export const enableDeviceTilt = async () => {
  if (!supportsDeviceTilt()) return false;
  if (listening) return true;

  if (deviceTiltNeedsPermission()) {
    try {
      const permission = await window.DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') return false;
    } catch {
      return false;
    }
  }

  startListening();
  return true;
};

export const subscribeDeviceTilt = (subscriber) => {
  subscribers.add(subscriber);
  if (!deviceTiltNeedsPermission()) startListening();
  return () => subscribers.delete(subscriber);
};
