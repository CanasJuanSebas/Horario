const socket = io('http://tu-servidor.com');

// Suscribirse a canales
socket.emit('join_room', 'schedules_channel');
socket.emit('join_room', 'tasks_channel');

// Escuchar cambios en tiempo real
socket.on('task_updated', (data) => {
    updateUIElement(data);
    showToast(`Actualización: ${data.description}`);
    highlightElement(`task-${data.id}`);
});

function updateUIElement(data) {
    // Lógica para actualizar el DOM sin recargar
    const cell = document.querySelector(`[data-id="${data.id}"]`);
    if (cell) {
        cell.classList.add('updated-flash');
        // Actualizar contenido...
    }
}

function showToast(msg) {
    // Implementación de notificaciones visuales reactivas
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}