const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware for Socket.IO
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user || user.status !== 'active') {
          return next(new Error('Authentication error: Invalid user'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        socket.userName = user.name;
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userName} connected (${socket.userId})`);
      
      // Store connected user
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        userId: socket.userId,
        userName: socket.userName,
        userRole: socket.userRole,
        connectedAt: new Date()
      });

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Join role-based rooms
      socket.join(`role_${socket.userRole}`);

      // Handle joining specific rooms
      socket.on('join_room', (roomName) => {
        socket.join(roomName);
        console.log(`User ${socket.userName} joined room: ${roomName}`);
      });

      socket.on('leave_room', (roomName) => {
        socket.leave(roomName);
        console.log(`User ${socket.userName} left room: ${roomName}`);
      });

      // Real-time inventory updates
      socket.on('inventory_update', (data) => {
        if (socket.userRole === 'admin' || socket.userRole === 'manager') {
          this.broadcastInventoryUpdate(data);
        }
      });

      // Real-time order updates
      socket.on('order_update', (data) => {
        this.broadcastOrderUpdate(data);
      });

      // Real-time notifications
      socket.on('send_notification', (data) => {
        this.sendNotification(data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userName} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to real-time updates',
        userId: socket.userId,
        timestamp: new Date()
      });
    });
  }

  broadcastInventoryUpdate(data) {
    // Broadcast to all managers and admins
    this.io.to('role_admin').to('role_manager').emit('inventory_updated', {
      type: 'inventory_update',
      data: data,
      timestamp: new Date()
    });
  }

  broadcastOrderUpdate(data) {
    // Broadcast to all connected users
    this.io.emit('order_updated', {
      type: 'order_update',
      data: data,
      timestamp: new Date()
    });
  }

  sendNotification(notificationData) {
    const { targetUserId, targetRole, message, type, data } = notificationData;

    const notification = {
      type: type || 'info',
      message,
      data,
      timestamp: new Date()
    };

    if (targetUserId) {
      // Send to specific user
      this.io.to(`user_${targetUserId}`).emit('notification', notification);
    } else if (targetRole) {
      // Send to all users with specific role
      this.io.to(`role_${targetRole}`).emit('notification', notification);
    } else {
      // Broadcast to all connected users
      this.io.emit('notification', notification);
    }
  }

  // Method to send notifications from outside the socket context
  sendNotificationFromAPI(notificationData) {
    this.sendNotification(notificationData);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users list (admin only)
  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Send message to specific user
  sendMessageToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Broadcast system maintenance message
  broadcastMaintenanceMessage(message, scheduledTime) {
    this.io.emit('system_maintenance', {
      message,
      scheduledTime,
      timestamp: new Date()
    });
  }

  // Force disconnect user (admin feature)
  forceDisconnectUser(userId) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      const socket = this.io.sockets.sockets.get(user.socketId);
      if (socket) {
        socket.emit('force_disconnect', {
          message: 'You have been disconnected by an administrator'
        });
        socket.disconnect(true);
      }
    }
  }
}

let socketHandler;

module.exports = (io) => {
  if (!socketHandler) {
    socketHandler = new SocketHandler(io);
  }
  return socketHandler;
};