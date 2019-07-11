// Importación de librerías/utilidades.
importScripts('/js/sw-utils.js');


// Lo primero que se hace en el service worker es definir los 
// nombres y tipos de memoria cache.
// El nombre debe llevar un sufijo que maneje la versión. Ej. static-cache-v1, dynamic-cache-v1, etc.
const STATIC_CACHE = "static-v2";
const INMUTABLE_CACHE = "inmutable-v1";
const DYNAMIC_CACHE = "dynamic-v1";

// El App Shell se forma de los elementos que siempre estarán disponibles en la App
// online u offline. 09/JULIO/2019
const APP_SHELL = [
    '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/spiderman.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/wolverine.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/hulk.jpg',
    'js/app.js',
    '/js/sw-utils.js'
];

// En el App Shell inmutable van los recursos que nunca se modificarán. 09/JULIO/2019
// Recordar que librerías como las de abajo de fonts, pueden contener links que 
// habría que agregar al cache dinámico.
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];


// **********  EVENTO DE INSTALACIÓN  **********
self.addEventListener('install', e => {

    // Almacenar en el cache el APP SHELL estático e inmutable.

    // CACHE ESTÁTICO.
    // Se crea un Promise para manejarlo como proceso asíncrono.
    const cacheStatic = caches.open(STATIC_CACHE)
    .then(cache => cache.addAll(APP_SHELL));


    // CACHE INMUTABLE.
    // Se crea un Promise para manejarlo como proceso asíncrono.
    const cacheInmutable = caches.open(INMUTABLE_CACHE)
    .then(cache => cache.addAll(APP_SHELL_INMUTABLE));


    // Con waitUntil me aseguro que finalicen los procesos de la instalación del Service Worker.
    // Se usa Promise.all para que se puedan ejecutar a la vez las diferentes promises. 09/JULIO/2019
    e.waitUntil(Promise.all([cacheStatic,cacheInmutable]));

});


// **********  EVENTO DE ACTIVACIÓN  **********
self.addEventListener('activate', e => {
    // Para crear automáticamente la estructura de este y los 
    // otros eventos, se puede escribir: "pwa" y aparecerán en un menú para 
    // elegir (esto requiere que se instale la librería PWA TOOLS).
    // Me haré cargo de borrar caches antiguos cuando haya cambio de versión.
    const borraCaches = caches.keys()
    // caches.keys() contiene el arreglo de caches existentes.
    .then( keys => {
        // Se itera cache por cache.
        keys.forEach( key => {
            // Si el cache no es la última versión del caché estático 
            if (key !== STATIC_CACHE && key.includes('static')) {
                // Se borra el cache.
                return caches.delete(key);
            }
        });
    });

    e.waitUntil(borraCaches);

});


// **********  EVENTO FETCH  **********
self.addEventListener('fetch', e => {

    // Estrategia cache con network fallback.
    const respuesta = caches.match( e.request)
    // Inicialmente se busca la petición en el cache.
    .then(res => {
        if (res) {
            // Si la petición o el recurso se encuentra en el cache, lo devolverá.
            return res;
        } else {
            // Manejo del Network fallback
            return fetch(e.request)
            // Si el recurso no se encuentra en el cache, lo buscará en Internet.
            .then( newRes => {
                // Se maneje el proceso de actualizar el cache con la respuesta de internet
                // o manejar la respuesta con error, porque tampoco se logró obtener el recurso
                // en internet. El método actualizaCacheDinamico se encuentra en js/sw-utils.js
               return actualizaCacheDinamico(DYNAMIC_CACHE,e.request,newRes);
            });
        }
    });

    e.respondWith( respuesta);



});


