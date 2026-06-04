// Find It — Service Worker v2 (Network First — pas de cache JS/CSS)
const CACHE = 'findit-v2';

// À l'installation — ne cache QUE index.html
self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});

// Activation — supprime tous les vieux caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch — Network ALWAYS first, pas de cache sur JS/CSS/API
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Toujours réseau pour les APIs et assets JS/CSS
  if (
    url.pathname.startsWith('/.netlify/') ||
    url.pathname.endsWith('.jsx') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    return; // Laisse le navigateur gérer normalement
  }

  // Pour le reste (HTML), network first avec fallback cache
  e.respondWith(
    fetch(e.request)
      .then(response => response)
      .catch(() => caches.match('/index.html'))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'Find It', body: 'Nouvelles offres !' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: 'findit-notification',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});
