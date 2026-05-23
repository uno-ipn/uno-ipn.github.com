// Назва кешу для версіонування. Змінюй номер при оновленні файлів сайту.
const CACHE_NAME = 'uno-line-factory-v1';

// Мінімальний набір файлів, необхідний для проходження перевірки на PWA
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Етап встановлення: кешуємо основні ресурси
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Кешування базових файлів');
            return cache.addAll(ASSETS_TO_CACHE);
        })
        .then(() => self.skipWaiting()) // Негайна активація нового Service Worker
    );
});

// Етап активації: видаляємо старі кеші, якщо назва CACHE_NAME змінилася
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Очищення старого кешу:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Одразу беремо контроль над сторінкою
    );
});

// Стратегія Network First (Мережа перш за все). 
// Додаток завжди намагатиметься завантажити свіжі дані з мережі,
// оскільки генерація коду через API потребує підключення.
// Якщо мережі немає, сайт завантажить оболонку з кешу.
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
        .catch(() => {
            // Фолбек на кеш у разі відсутності інтернету
            return caches.match(event.request);
        })
    );
});
