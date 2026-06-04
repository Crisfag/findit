// Find It — Service Worker PWA
const CACHE = 'findit-v1';
const STATIC = ['/', '/index.html', '/style.css', '/app.jsx', '/manifest.json'];

// Installation — met en cache les fichiers statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// Activation — nettoie les vieux caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — Network first pour les APIs, Cache first pour les assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // APIs Netlify Functions → toujours réseau
  if (url.pathname.startsWith('/.netlify/')) {
    return;
  }

  // Assets statiques → cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// Push notifications (pour les nouveautés)
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'Find It', body: 'Nouvelles offres disponibles !' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/manifest.json',
      badge: '/manifest.json',
      tag: 'findit-notification',
      data: { url: data.url || '/' }
    })
  );
});

// Clic sur notification → ouvre l'app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.openWindow(e.notification.data?.url || '/')
  );
});
