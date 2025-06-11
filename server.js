import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from "./src/config/index.js";
import cors from 'cors';

const app = express();
const server = createServer(app);

// Configurar CORS para Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      `${config.API_BACKEND_URL}`,
      `${config.IP_PROPIA}:3000`, 
      `${config.API_FRONTEND_URL}`, 
    ], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware para CORS en Express
app.use(cors());
app.use(express.json());

// Almacenar usuarios conectados
const connectedUsers = new Map();
const userSockets = new Map();

// Middleware de autenticación para Socket.IO
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }
    
    const userId = socket.handshake.auth.userId;
    const username = socket.handshake.auth.username;
    
    if (!userId || !username) {
      return next(new Error('Datos de usuario incompletos'));
    }

    // Agregar información del usuario al socket
    socket.userId = parseInt(userId);
    socket.username = username;
    
    next();
  } catch (error) {
    console.error('Error de autenticación Socket.IO:', error);
    next(new Error('Token inválido'));
  }
});

// Manejar conexiones
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.username} (ID: ${socket.userId})`);

  // Registrar usuario conectado
  connectedUsers.set(socket.userId, {
    id: socket.userId,
    username: socket.username,
    socketId: socket.id,
    lastSeen: new Date()
  });
  
  userSockets.set(socket.userId, socket);

  // Notificar a otros usuarios que este usuario se conectó 
  socket.broadcast.emit('user-online', {
    userId: socket.userId,
    username: socket.username
  });

  // Unirse a una sala de chat privado
  socket.on('join-chat', (data) => {
    try {
      const { chatId, otherUserId } = data;
      
      if (!chatId || !otherUserId) {
        socket.emit('error', { message: 'Datos de chat incompletos' });
        return;
      }

      // Generar nombre de sala consistente (mismo para ambos usuarios)
      const roomName = `chat-${Math.min(socket.userId, otherUserId)}-${Math.max(socket.userId, otherUserId)}`;
      
      // Unirse a la sala
      socket.join(roomName);
      socket.currentChatRoom = roomName;
      socket.currentChatId = chatId;
      
      console.log(`Usuario ${socket.username} se unió al chat ${chatId} (sala: ${roomName})`);
      
      // Confirmar que se unió al chat
      socket.emit('chat-joined', {
        chatId: chatId,
        roomName: roomName,
        message: 'Te has unido al chat'
      });

      // Notificar al otro usuario si está conectado
      const otherUserSocket = userSockets.get(otherUserId);
      if (otherUserSocket) {
        otherUserSocket.emit('user-joined-chat', {
          userId: socket.userId,
          username: socket.username,
          chatId: chatId
        });
      }
    } catch (error) {
      console.error('Error al unirse al chat:', error);
      socket.emit('error', { message: 'Error al unirse al chat' });
    }
  });

  // Salir de una sala de chat
  socket.on('leave-chat', (data) => {
    try {
      if (socket.currentChatRoom) {
        socket.leave(socket.currentChatRoom);
        console.log(`Usuario ${socket.username} salió del chat ${socket.currentChatId}`);
        
        // Notificar a la sala que el usuario salió
        socket.to(socket.currentChatRoom).emit('user-left-chat', {
          userId: socket.userId,
          username: socket.username,
          chatId: socket.currentChatId
        });
        
        socket.currentChatRoom = null;
        socket.currentChatId = null;
      }
    } catch (error) {
      console.error('Error al salir del chat:', error);
    }
  });

  // Manejar envío de mensajes
  socket.on('send-message', (data) => {
    try {
      const { chatId, message, otherUserId } = data;
      
      if (!chatId || !message || !otherUserId) {
        socket.emit('error', { message: 'Datos de mensaje incompletos' });
        return;
      }

      // Generar nombre de sala
      const roomName = `chat-${Math.min(socket.userId, otherUserId)}-${Math.max(socket.userId, otherUserId)}`;
      
      // Crear objeto de mensaje para transmitir
      const messageData = {
        chatId: chatId,
        message: message.trim(),
        sender: {
          id: socket.userId,
          username: socket.username
        },
        timestamp: new Date().toISOString(),
        tempId: data.tempId // ID temporal para identificar el mensaje en el frontend
      };

      // Enviar mensaje a todos en la sala (incluido el remitente)
      io.to(roomName).emit('new-message', messageData);
      
      console.log(`Mensaje enviado en chat ${chatId}: ${socket.username}: ${message}`);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      socket.emit('error', { message: 'Error al enviar mensaje' });
    }
  });

  // Manejar indicador de "escribiendo..."
  socket.on('typing-start', (data) => {
    try {
      const { chatId, otherUserId } = data;
      
      if (!chatId || !otherUserId) return;

      const roomName = `chat-${Math.min(socket.userId, otherUserId)}-${Math.max(socket.userId, otherUserId)}`;
      
      // Notificar a otros en la sala (excepto al remitente)
      socket.to(roomName).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
        chatId: chatId
      });
    } catch (error) {
      console.error('Error en typing-start:', error);
    }
  });

  socket.on('typing-stop', (data) => {
    try {
      const { chatId, otherUserId } = data;
      
      if (!chatId || !otherUserId) return;

      const roomName = `chat-${Math.min(socket.userId, otherUserId)}-${Math.max(socket.userId, otherUserId)}`;
      
      // Notificar a otros en la sala que dejó de escribir
      socket.to(roomName).emit('user-stopped-typing', {
        userId: socket.userId,
        username: socket.username,
        chatId: chatId
      });
    } catch (error) {
      console.error('Error en typing-stop:', error);
    }
  });

  // Manejar marcado de mensajes como leídos
  socket.on('mark-as-read', (data) => {
    try {
      const { chatId, otherUserId } = data;
      
      if (!chatId || !otherUserId) return;

      const roomName = `chat-${Math.min(socket.userId, otherUserId)}-${Math.max(socket.userId, otherUserId)}`;
      
      // Notificar al otro usuario que los mensajes fueron leídos
      socket.to(roomName).emit('messages-read', {
        chatId: chatId,
        readBy: socket.userId
      });
    } catch (error) {
      console.error('Error en mark-as-read:', error);
    }
  });

  // Obtener lista de usuarios conectados
  socket.on('get-online-users', () => {
    try {
      const onlineUsers = Array.from(connectedUsers.values()).map(user => ({
        id: user.id,
        username: user.username,
        lastSeen: user.lastSeen
      }));
      
      socket.emit('online-users', onlineUsers);
    } catch (error) {
      console.error('Error al obtener usuarios conectados:', error);
    }
  });

  // Manejar desconexión
  socket.on('disconnect', (reason) => {
    console.log(`Usuario desconectado: ${socket.username} (${reason})`);

    // Salir del chat actual si está en uno
    if (socket.currentChatRoom) {
      socket.to(socket.currentChatRoom).emit('user-left-chat', {
        userId: socket.userId,
        username: socket.username,
        chatId: socket.currentChatId
      });
    }

    // Remover de usuarios conectados
    connectedUsers.delete(socket.userId);
    userSockets.delete(socket.userId);

    // Notificar a otros usuarios que este usuario se desconectó
    socket.broadcast.emit('user-offline', {
      userId: socket.userId,
      username: socket.username
    });
  });

  // Manejar errores
  socket.on('error', (error) => {
    console.error(`Error en socket ${socket.username}:`, error);
  });
});

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    connectedUsers: connectedUsers.size,
    timestamp: new Date().toISOString()
  });
});

// Ruta para obtener usuarios conectados (para debug)
app.get('/connected-users', (req, res) => {
  const users = Array.from(connectedUsers.values());
  res.json({ users });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Servidor Socket.IO ejecutándose en puerto ${PORT}`);
  console.log(`📊 Panel de estado: http://localhost:${PORT}/health`);
});

// Manejar errores del servidor
server.on('error', (error) => {
  console.error('Error del servidor:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Cerrando servidor Socket.IO...');
  server.close(() => {
    console.log('Servidor Socket.IO cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Cerrando servidor Socket.IO...');
  server.close(() => {
    console.log('Servidor Socket.IO cerrado');
    process.exit(0);
  });
});