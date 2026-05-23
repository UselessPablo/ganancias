// public/service-worker.js
const CACHE_NAME = 'ventas-pwa-v2'; // Cambié la versión
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Activar inmediatamente
    );
});

// Activar Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker activando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Eliminando cache antiguo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Tomar control inmediatamente
    );
});

// Escuchar mensajes para mostrar notificaciones
self.addEventListener('message', (event) => {
    console.log('Mensaje recibido en SW:', event.data);

    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        // Mostrar notificación incluso si la app no está en foco
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            tag: 'cobro-pendiente',
            data: {
                url: event.data.url || '/',
                timestamp: Date.now()
            }
        });
    }
});

// Manejar clic en notificación
self.addEventListener('notificationclick', (event) => {
    console.log('Notificación clickeada');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                // Si hay una ventana abierta, enfocarla
                for (let client of windowClients) {
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url);
                }
            })
    );
});

// Manejar errores de push
self.addEventListener('push', (event) => {
    console.log('Push recibido:', event);
    // Aquí manejarías notificaciones push del servidor
});

self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('Suscripción push cambiada');
    // Aquí manejarías la renovación de suscripción
});