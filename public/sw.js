const CACHE_NAME = 'amipattern-v1'

// Al instalar: cachear el app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
      ])
    )
  )
  self.skipWaiting()
})

// Al activar: limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch: Network first, fallback a cache para navegación
self.addEventListener('fetch', event => {
  // Solo interceptar requests de navegación (no Supabase API)
  if (event.request.url.includes('supabase.co')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cachear respuesta exitosa
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request).then(r => r || caches.match('/index.html')))
  )
})
