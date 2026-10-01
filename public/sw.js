// Retire the old offline cache so sale details are not served from a stale copy.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('maison-lac-')).map(key => caches.delete(key)));
    await self.registration.unregister();
  })());
});
