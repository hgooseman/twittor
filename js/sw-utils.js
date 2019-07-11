// Es es un archivo auxiliar del Service Worker que permite trasladar
// cierta funcionalidad.
function actualizaCacheDinamico(dynamicCache, peticion, respuesta) {

    // Si la respuesta tiene datos, procederá a actualizar el cache dinámico.
    if (respuesta.ok) {
        return caches.open(dynamicCache)
        .then(cache => {
            cache.put(peticion,respuesta.clone());
            return respuesta.clone();
        });
    } else {
        return respuesta;
    }
}