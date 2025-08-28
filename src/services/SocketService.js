import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  initialize() {
    if (this.socket) {
      console.log('🔗 Socket already initialized');
      return;
    }

    try {
      // Connect to backend socket server
      this.socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventListeners();
      console.log('🔗 Socket.IO initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Socket.IO:', error);
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('✅ Connected to Socket.IO server');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('❌ Disconnected from Socket.IO server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.reconnectAttempts++;
    });

    // Stock update events
    this.socket.on('stockUpdate', (data) => {
      console.log('📦 Stock update received:', data);
      this.emit('stockUpdate', data);
    });

    // Order events
    this.socket.on('newOrder', (data) => {
      console.log('🛒 New order received:', data);
      this.emit('newOrder', data);
    });

    this.socket.on('orderStatusUpdate', (data) => {
      console.log('📋 Order status updated:', data);
      this.emit('orderStatusUpdate', data);
    });

    // Product events
    this.socket.on('productUpdate', (data) => {
      console.log('📦 Product updated:', data);
      this.emit('productUpdate', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      console.log('🔔 Notification received:', data);
      this.emit('notification', data);
    });
  }

  // Event emission to registered listeners
  emit(event, data) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in socket event listener for ${event}:`, error);
      }
    });
  }

  // Register event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return cleanup function
    return () => this.off(event, callback);
  }

  // Remove event listener
  off(event, callback) {
    const eventListeners = this.listeners.get(event) || [];
    const index = eventListeners.indexOf(callback);
    if (index > -1) {
      eventListeners.splice(index, 1);
    }
  }

  // Emit event to server
  send(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('❌ Cannot send event: Socket not connected');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null,
    };
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('🔗 Socket disconnected');
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;