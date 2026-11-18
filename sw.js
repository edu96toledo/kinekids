// KineKids Service Worker - Cache para funcionamiento offline
const CACHE_NAME = 'kinekids-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/styles.css',
    './manifest.json',
    './img/kinekids-logo.jpg',
    './js/app.js',
    './js/models/DatabaseModel.js',
    './js/models/RutValidator.js',
    './js/models/QuestionsModel.js',
    './js/models/TriageModel.js',
    './js/models/AuditModel.js',
    './js/views/ModalView.js',
    './js/views/HeaderView.js',
    './js/views/AuthView.js',
    './js/views/ParentView.js',
    './js/views/ClinicianView.js',
    './js/views/AdminView.js',
    './js/views/ReportView.js',
    './js/controllers/AppController.js',
    './js/controllers/AuthController.js',
    './js/controllers/ChildController.js',
    './js/controllers/EvaluationController.js',
    './js/controllers/ClinicianController.js',
    './js/controllers/AdminController.js'
];

// Instalar: pre-cachear todos los archivos estáticos de forma resiliente
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const asset of ASSETS_TO_CACHE) {
                try {
                    await cache.add(asset);
                } catch (err) {
                    console.warn('[SW] Aviso: recurso no cacheado individualmente:', asset);
                }
            }
            return self.skipWaiting();
        })
    );
});

// Activar: limpiar caches antiguos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: servir desde cache, con fallback a red
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((response) => {
                    // No cachear peticiones que no sean GET o de otros orígenes
                    if (!response || response.status !== 200 || event.request.method !== 'GET') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                });
            })
            .catch(() => {
                // Si falla todo, devolver la página principal
                return caches.match('./index.html');
            })
    );
});
