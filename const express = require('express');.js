const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const pool = new Pool({ /* config */ });

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    // Unirse a canales específicos por recurso
    socket.on('join_room', (room) => socket.join(room));

    // Manejar actualizaciones de tareas
    socket.on('update_task', async (data) => {
        try {
            // 1. Validar reglas de negocio
            if (!data.task.trim()) throw new Error("Tarea vacía");

            // 2. Persistir en DB con Auditoría
            const result = await pool.query(
                'UPDATE tasks SET description = $1, due_date = $2 WHERE id = $3 RETURNING *',
                [data.task, data.due, data.id]
            );

            // 3. Propagar cambio a través de WebSockets (<100ms)
            io.to('tasks_channel').emit('task_updated', result.rows[0]);
            
        } catch (error) {
            socket.emit('error_notification', { message: error.message });
        }
    });
});

server.listen(3000, () => console.log('Servidor real-time en puerto 3000'));