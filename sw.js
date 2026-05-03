// Importar Supabase dentro del Service Worker
importScripts('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');

const SUPABASE_URL = 'https://kibomtadrvantlzjjyvc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lzuN3b6Q7POh5vC4EQ1IxQ_Xs26vbri';
let supabaseClient;

// Materias para identificar en la notificación
const MATS_NAMES = {
  '0-0':'Informática', '0-1':'Matemáticas', '0-2':'Física',    '0-3':'Filosofía',
  '1-0':'Robótica',    '1-1':'Español',     '1-2':'Español',   '1-3':'Español',
  '2-0':'Inglés',      '2-1':'Física',      '2-2':'Geometría', '2-3':'Inglés',
  '3-0':'Política',    '3-1':'Ética',       '3-2':'Inglés',    '3-3':'Español',
  '4-0':'Matemáticas', '4-1':'Ciencias',    '4-2':'Física',    '4-3':'Artística',
  '5-0':'Inglés',      '5-1':'Inglés',      '5-2':'Sociales',  '5-3':'Matemáticas',
  '6-0':'Química',     '6-1':'Química',     '6-2':'Filosofía', '6-3':'Estadística',
  '7-0':'Edu. Física', '7-1':'Economía',    '7-2':'Química',   '7-3':'Religión',
};

// Inicializar Supabase
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Escuchar cambios en tiempo real desde el segundo plano
  supabaseClient
    .channel('public:schedules')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, payload => {
      const row = payload.new;
      if (row && row.task) {
        showNotification(row);
      }
    })
    .subscribe();
}

function showNotification(row) {
  const subject = row.cell_key.startsWith('mil-') ? "Fase Militar" : (MATS_NAMES[row.cell_key] || "Materia");
  const title = `Nueva tarea en ${subject}`;
  const options = {
    body: `Que hay que hacer:\n${row.task}`,
    icon: 'colegio.png',
    badge: 'colegio.png',
    vibrate: [200, 100, 200],
    tag: 'task-' + row.cell_key,
    renotify: true,
    data: { url: './horario.html' }
  };

  self.registration.showNotification(title, options);
}

// Mantener el Service Worker activo
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Manejar clic en la notificación
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes('horario.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./horario.html');
      }
    })
  );
});

// Escuchar mensajes directos desde la web
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    showNotification({
      cell_key: event.data.cell_key || 'unknown',
      task: event.data.body.replace('Que hay que hacer:\n', '')
    });
  }
});
