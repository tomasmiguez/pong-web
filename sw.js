const STATIC_ROUTES = [
  '/',
  '/index.html',
  '/ping.html',
  '/pong.html',
  '/script.js',
  '/img.jpg',
];

self.addEventListener('install', function(event) {
  event.waitUntil(install());
});

async function install() {
  const cache = await caches.open('v1');

  cache.addAll(STATIC_ROUTES);

  const open = indexedDB.open('v1');

  open.onerror = function(event) {
    console.error('Error opening indexedDB:', event);
  };
  open.onupgradeneeded = function(event) {
    const db = event.target.result;
    const requests = db.createObjectStore('requests', { autoIncrement: true });
  };
}

self.addEventListener('fetch', function(event) {
  event.respondWith(retrieveFromCache(event.request))
});

async function retrieveFromCache(request) {
  const cache = await caches.open('v1');
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  if (navigator.onLine) {
    return fetch(request);
  }

  bufferRequest(request);

  return new Response(JSON.stringify({ error: 'Offline!' }));
}

async function bufferRequest(request) {
  const open = indexedDB.open('v1');

  open.onerror = function(event) {
    console.error('Error opening indexedDB:', event);
  }
  open.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction('requests', 'readwrite');
    const requests = transaction.objectStore('requests');

    const requestData = { url: request.url, method: request.method };
    requests.add(requestData);
  }
}

setInterval(checkAndRetryRequests, 1000);

async function checkAndRetryRequests() {
  if (!navigator.onLine) {
    return;
  }

  const open = indexedDB.open('v1');

  open.onerror = function(event) {
    console.error('Error opening indexedDB:', event);
  }

  open.onsuccess = async function(event) {
    const db = event.target.result;
    const transaction = db.transaction('requests', 'readwrite');
    const requests = transaction.objectStore('requests');

    const cursor = requests.openCursor();
    const retryPromises = [];

    cursor.onsuccess = async function(event) {
      const cursor = event.target.result;

      if (cursor) {
        const requestData = cursor.value;
        const retryPromise = retryRequest(requestData);
        retryPromises.push(retryPromise);

        requests.delete(cursor.primaryKey);
        cursor.continue();
      }
    };

    await Promise.all(retryPromises);
  }
}

async function retryRequest(requestData) {
  const { url, method } = requestData;
  await fetch(url, { method });
}
