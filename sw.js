// 2Du! Enhanced Service Worker for Advanced PWA functionality
const CACHE_NAME = '2du-v2.0.0';
const STATIC_CACHE = '2du-static-v2.0.0';
const DYNAMIC_CACHE = '2du-dynamic-v2.0.0';
const IMAGE_CACHE = '2du-images-v2.0.0';

// Core app shell resources
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/pwa.css',
  '/js/script.js',
  '/js/pwa-features.js',
  '/manifest.json',
  '/images/2du-logo-192x192.png',
  '/images/2du-logo-512x512.png',
  '/offline.html'
];

// Dynamic content that should be cached
const DYNAMIC_ASSETS = [
  '/api/tasks',
  '/api/progress',
  '/api/social'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('2Du! PWA: Installing service worker v2.0.0');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('2Du! PWA: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('2Du! PWA: Preparing dynamic cache');
        return Promise.resolve();
      }),
      caches.open(IMAGE_CACHE).then(cache => {
        console.log('2Du! PWA: Preparing image cache');
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('2Du! PWA: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('2Du! PWA: Activating service worker v2.0.0');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('2Du! PWA: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('2Du! PWA: Activation complete');
    })
  );
});

// Fetch event - advanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Filter out non-HTTP(S) requests (chrome-extension://, moz-extension://, etc.)
  if (!url.protocol.startsWith('http')) {
    console.log('2Du! PWA: Skipping non-HTTP request:', url.href);
    return;
  }
  
  // Skip requests to different origins unless they're for known CDNs
  if (url.origin !== self.location.origin && !isAllowedExternalOrigin(url.origin)) {
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (STATIC_ASSETS.includes(url.pathname)) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (url.pathname.startsWith('/api/')) {
    // Network first for API calls with offline fallback
    event.respondWith(networkFirstWithOfflineSupport(request));
  } else if (url.pathname.startsWith('/images/')) {
    // Cache first for images with network fallback
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (url.pathname.startsWith('/admin/')) {
    // Network only for admin (requires authentication)
    event.respondWith(fetch(request));
  } else {
    // Stale while revalidate for other content
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Helper function to check if external origin is allowed for caching
function isAllowedExternalOrigin(origin) {
  const allowedOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com'
  ];
  
  return allowedOrigins.includes(origin);
}

// Caching strategies
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('2Du! PWA: Cache first strategy failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

async function networkFirstWithOfflineSupport(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('2Du! PWA: Network failed, trying cache for:', request.url);
    
    // Try to get from cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline data for specific endpoints
    if (request.url.includes('/api/tasks')) {
      return new Response(JSON.stringify(await getOfflineTasks()), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Offline - data not available', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline task management
self.addEventListener('sync', (event) => {
  console.log('2Du! PWA: Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncOfflineTasks());
  } else if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData());
  } else if (event.tag === 'sync-social') {
    event.waitUntil(syncSocialUpdates());
  }
});

// Enhanced push notification handling
self.addEventListener('push', (event) => {
  console.log('2Du! PWA: Push notification received');
  
  let notificationData = {
    title: '2Du! Productivity Reminder',
    body: 'Time to check your tasks and stay productive!',
    icon: '/images/2du-logo-192x192.png',
    badge: '/images/2du-badge-72x72.png',
    tag: 'productivity-reminder',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('2Du! PWA: Error parsing push data:', error);
    }
  }
  
  // Customize notification based on type
  if (notificationData.type === 'task-reminder') {
    notificationData.actions = [
      {
        action: 'complete',
        title: 'Mark Complete',
        icon: '/images/icons/check.png'
      },
      {
        action: 'snooze',
        title: 'Snooze 15min',
        icon: '/images/icons/snooze.png'
      }
    ];
  } else if (notificationData.type === 'social-update') {
    notificationData.actions = [
      {
        action: 'view',
        title: 'View Update',
        icon: '/images/icons/view.png'
      },
      {
        action: 'like',
        title: 'Like',
        icon: '/images/icons/heart.png'
      }
    ];
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('2Du! PWA: Notification clicked:', event.action);
  
  event.notification.close();
  
  const { action, notification } = event;
  const data = notification.data || {};
  
  if (action === 'complete') {
    // Handle task completion
    event.waitUntil(handleTaskCompletion(data.taskId));
  } else if (action === 'snooze') {
    // Handle task snoozing
    event.waitUntil(handleTaskSnooze(data.taskId, 15));
  } else if (action === 'view') {
    // Open specific view
    event.waitUntil(openApp(data.url || '/'));
  } else if (action === 'like') {
    // Handle social interaction
    event.waitUntil(handleSocialLike(data.postId));
  } else {
    // Default action - open app
    event.waitUntil(openApp(data.url || '/'));
  }
});

// Helper functions for offline functionality
async function syncOfflineTasks() {
  try {
    const offlineTasks = await getOfflineTasks();
    console.log('2Du! PWA: Syncing', offlineTasks.length, 'offline tasks');
    
    for (const task of offlineTasks) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task)
        });
        
        if (response.ok) {
          await removeOfflineTask(task.id);
        }
      } catch (error) {
        console.error('2Du! PWA: Failed to sync task:', task.id, error);
      }
    }
    
    console.log('2Du! PWA: Task sync completed');
  } catch (error) {
    console.error('2Du! PWA: Task sync failed:', error);
  }
}

async function syncProgressData() {
  try {
    const offlineProgress = await getOfflineProgress();
    console.log('2Du! PWA: Syncing progress data');
    
    for (const progress of offlineProgress) {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(progress)
        });
      } catch (error) {
        console.error('2Du! PWA: Failed to sync progress:', error);
      }
    }
  } catch (error) {
    console.error('2Du! PWA: Progress sync failed:', error);
  }
}

async function syncSocialUpdates() {
  try {
    const offlineSocial = await getOfflineSocial();
    console.log('2Du! PWA: Syncing social updates');
    
    for (const update of offlineSocial) {
      try {
        await fetch('/api/social', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update)
        });
      } catch (error) {
        console.error('2Du! PWA: Failed to sync social update:', error);
      }
    }
  } catch (error) {
    console.error('2Du! PWA: Social sync failed:', error);
  }
}

// IndexedDB operations for offline storage
async function getOfflineTasks() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('2du-offline', 2);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('social')) {
        db.createObjectStore('social', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getOfflineProgress() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('2du-offline', 2);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['progress'], 'readonly');
      const store = transaction.objectStore('progress');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getOfflineSocial() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('2du-offline', 2);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['social'], 'readonly');
      const store = transaction.objectStore('social');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function removeOfflineTask(taskId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('2du-offline', 2);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const deleteRequest = store.delete(taskId);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Notification action handlers
async function handleTaskCompletion(taskId) {
  try {
    await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'POST'
    });
    console.log('2Du! PWA: Task completed via notification');
  } catch (error) {
    console.error('2Du! PWA: Failed to complete task:', error);
  }
}

async function handleTaskSnooze(taskId, minutes) {
  try {
    await fetch(`/api/tasks/${taskId}/snooze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ minutes })
    });
    console.log('2Du! PWA: Task snoozed via notification');
  } catch (error) {
    console.error('2Du! PWA: Failed to snooze task:', error);
  }
}

async function handleSocialLike(postId) {
  try {
    await fetch(`/api/social/${postId}/like`, {
      method: 'POST'
    });
    console.log('2Du! PWA: Social post liked via notification');
  } catch (error) {
    console.error('2Du! PWA: Failed to like post:', error);
  }
}

async function openApp(url = '/') {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });
  
  // If app is already open, focus it
  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      await client.focus();
      if (url !== '/') {
        client.navigate(url);
      }
      return;
    }
  }
  
  // Open new window if app is not open
  await self.clients.openWindow(url);
}

console.log('2Du! PWA: Enhanced service worker v2.0.0 loaded');

