// sw.js - Service Worker para ANI Campo
const CACHE_NAME = 'ani-campo-v1';
const urlsToCache = [
  '/APP_Informes_Campo_ANI/',
  '/APP_Informes_Campo_ANI/index.html',
  '/APP_Informes_Campo_ANI/login.html',
  '/APP_Informes_Campo_ANI/admin-usuarios.html',
  '/APP_Informes_Campo_ANI/style.css',
  '/APP_Informes_Campo_ANI/app.js',
  '/APP_Informes_Campo_ANI/auth.js',
  '/APP_Informes_Campo_ANI/config.js',
  '/APP_Informes_Campo_ANI/manifest.json'
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar el Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retornar caché si existe, sino hacer petición
        return response || fetch(event.request);
      })
  );
});