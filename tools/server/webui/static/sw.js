const CACHE_NAME = 'llama-server-v1';

self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	if (
		url.pathname.startsWith('/v1') ||
		url.pathname.startsWith('/props') ||
		url.pathname.startsWith('/models') ||
		url.pathname.startsWith('/tools') ||
		url.pathname.startsWith('/cors-proxy')
	) {
		return;
	}

	event.respondWith(
		fetch(event.request).catch(() => caches.match(event.request))
	);
});
