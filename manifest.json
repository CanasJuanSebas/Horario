self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Nueva actualización';
  const options = {
    body: data.body || 'Hay cambios en el horario.',
    icon: 'colegio.png',
    badge: 'colegio.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {action: 'explore', title: 'Ver Horario'}
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Escuchar mensajes directos desde la web cuando está abierta o en segundo plano
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const title = event.data.title;
    const options = {
      body: event.data.body,
      icon: 'colegio.png',
      badge: 'colegio.png',
      tag: 'schedule-update', // Evita spam de notificaciones
      renotify: true,
      vibrate: [100, 50, 100]
    };
    self.registration.showNotification(title, options);
  }
});
