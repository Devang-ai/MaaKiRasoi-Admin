import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://maakirasoi-tb7w.onrender.com';

export const socket = io(SOCKET_URL, {
    autoConnect: false
});

export const connectAdminSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
    socket.emit('join_admin');
    
    socket.off('connect').on('connect', () => {
        socket.emit('join_admin');
    });
};

export const disconnectAdminSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
