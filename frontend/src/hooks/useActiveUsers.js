import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

export const useActiveUsers = () => {
  const [activeUsers, setActiveUsers] = useState({
    activeElders: 0,
    activeCaregivers: 0,
    timestamp: null
  });
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useSocket();

  // Fetch initial stats from API
  useEffect(() => {
    const fetchInitialStats = async () => {
      try {
        console.log('Fetching initial active users stats...');
        const response = await api.get('/stats/active-users');
        console.log('Initial stats response:', response.data);
        if (response.data.success) {
          setActiveUsers(response.data.data);
          console.log('Active users updated:', response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch initial active users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStats();
  }, []);

  // Listen for real-time updates via socket
  useEffect(() => {
    if (socket && connected) {
      console.log('Setting up socket listener for active-users-update');
      
      const handleActiveUsersUpdate = (data) => {
        console.log('Received active-users-update:', data);
        setActiveUsers(data);
        setLoading(false);
      };

      socket.on('active-users-update', handleActiveUsersUpdate);

      return () => {
        console.log('Cleaning up socket listener for active-users-update');
        socket.off('active-users-update', handleActiveUsersUpdate);
      };
    } else {
      console.log('Socket not ready:', { socket: !!socket, connected });
    }
  }, [socket, connected]);

  return { activeUsers, loading };
};