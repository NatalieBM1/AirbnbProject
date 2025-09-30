import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return '🏠';
      case 'payment': return '💳';
      case 'message': return '💬';
      case 'security': return '🔒';
      case 'recommendation': return '⭐';
      default: return '📢';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Please log in to view notifications</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-header">
          <h1>Notifications</h1>
          <p>Stay updated with your bookings and account activity</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchNotifications} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <div className="notifications-content">
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h3 className="notification-title">
                        {notification.title}
                        {!notification.isRead && <span className="unread-dot"></span>}
                      </h3>
                      <span className="notification-time">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    
                    {!notification.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mark-read-button"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-notifications">
              <div className="empty-icon">🔔</div>
              <h3>No notifications yet</h3>
              <p>You're all caught up! Check back later for updates on your bookings and account.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;