import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          userId: user.id,
          role: user.role
        }
      });

      newSocket.on('connect', () => {
        setConnected(true);
        console.log('Socket connected with ID:', newSocket.id);
        
        // Authenticate user with socket
        const userData = {
          userId: user.id,
          role: user.role,
          name: user.name
        };
        console.log('Emitting user-authenticated:', userData);
        newSocket.emit('user-authenticated', userData);
        
        // Join appropriate room based on user role
        if (user.role === 'elder') {
          console.log('Joining elder room for user:', user.id);
          newSocket.emit('join-elder-room', user.id);
        } else if (user.role === 'caregiver') {
          console.log('Joining caregiver room for user:', user.id);
          newSocket.emit('join-caregiver-room', user.id);
        }
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
        console.log('Socket disconnected');
      });

      // Emergency event handlers
      newSocket.on('new-emergency', (emergencyData) => {
        toast.error(
          `🚨 EMERGENCY ALERT: ${emergencyData.elderName} needs help!`,
          {
            duration: 0, // Don't auto-dismiss
            style: {
              background: '#dc3545',
              color: 'white',
              fontWeight: 'bold'
            }
          }
        );
        
        // Play emergency sound if available
        if ('Audio' in window) {
          const audio = new Audio('/emergency-alert.mp3');
          audio.play().catch(console.error);
        }
      });

      newSocket.on('emergency-resolved', (data) => {
        toast.success(
          `Emergency resolved for ID: ${data.emergencyId}`,
          {
            duration: 5000,
            style: {
              background: '#28a745',
              color: 'white'
            }
          }
        );
      });

      // Debug listener for active users updates
      newSocket.on('active-users-update', (data) => {
        console.log('SocketContext received active-users-update:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Clean up socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user]);

  const value = {
    socket,
    connected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};