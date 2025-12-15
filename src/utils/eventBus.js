const channelName = 'cloudbox-events';

const localBus = typeof window !== 'undefined' ? new EventTarget() : null;
const broadcastSupported = typeof window !== 'undefined' && 'BroadcastChannel' in window;
const broadcastChannel = broadcastSupported ? new BroadcastChannel(channelName) : null;

if (broadcastChannel && localBus) {
  broadcastChannel.onmessage = (event) => {
    if (!event?.data?.type) return;
    localBus.dispatchEvent(new CustomEvent(event.data.type, { detail: event.data.detail }));
  };
}

export const emitAppEvent = (type, detail) => {
  if (!type || !localBus) return;
  localBus.dispatchEvent(new CustomEvent(type, { detail }));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type, detail });
  }
};

export const subscribeAppEvent = (type, handler) => {
  if (!localBus || !type || typeof handler !== 'function') return () => {};
  const listener = (event) => handler(event.detail);
  localBus.addEventListener(type, listener);
  return () => localBus.removeEventListener(type, listener);
};


