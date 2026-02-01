// Market Helper - Service Worker v2.0
const CACHE_NAME = 'market-helper-v2.0.0';
const RUNTIME_CACHE = 'market-helper-runtime';

// Arquivos para cachear
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/app.js',
  '/supabase.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker v2.0...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando arquivos essenciais');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('[SW] ✅ Service Worker instalado com sucesso!');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] ❌ Erro ao instalar:', err);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] ✅ Service Worker ativado!');
        return self.clients.claim();
      })
  );
});

// Estratégia de cache: Network First, fallback to Cache
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições que não são GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar APIs externas (Supabase, etc)
  if (url.origin.includes('supabase.co') || 
      url.origin.includes('supabase.in')) {
    return;
  }

  event.respondWith(
    // Tenta buscar da rede primeiro
    fetch(request)
      .then(response => {
        // Se conseguiu da rede e é uma resposta válida
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          
          // Salva no cache runtime
          caches.open(RUNTIME_CACHE)
            .then(cache => {
              cache.put(request, responseClone);
            });
        }
        
        return response;
      })
      .catch(() => {
        // Se falhou (offline), tenta buscar do cache
        return caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              console.log('[SW] ♻️ Servindo do cache:', request.url);
              return cachedResponse;
            }
            
            // Se é navegação e não está no cache, retorna página offline
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // Para outros recursos, retorna erro offline
            return new Response('Offline - Recurso não disponível', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[SW] ✅ Cache limpo!');
      })
    );
  }
});

// Sincronização em background (quando voltar online)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-lists') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] 🔄 Sincronizando dados...');
  // Aqui você pode implementar sincronização com Supabase
  // Por exemplo, enviar listas pendentes que foram criadas offline
}

// Push notifications (futuro)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Você tem uma nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Market Helper', options)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] 🚀 Service Worker v2.0 carregado e pronto!');
