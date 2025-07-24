const CACHE_NAME = 'abastecimento-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Arquivos essenciais para funcionamento offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando versão 2...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Cache estático criado');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Erro ao criar cache estático:', error);
      })
  );
  
  // Força a ativação imediata
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando versão 2...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assume controle imediatamente
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições para Firebase e outras APIs externas durante offline
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estratégia Cache First para recursos estáticos
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Só cachear respostas válidas
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // Se offline, retornar página principal para SPAs
              if (request.destination === 'document') {
                return caches.match('/index.html');
              }
            });
        })
    );
  }
});

// Escutar mensagens do app principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Sincronização em background (quando voltar online)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Evento de sincronização:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Notificar o app principal para sincronizar dados
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC',
            action: 'sync-data'
          });
        });
      })
    );
  }
});

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push recebido');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/pwa-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Sistema de Abastecimento', options)
  );
});

// Lidar com cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        }
        return self.clients.openWindow('/');
      })
    );
  }
});