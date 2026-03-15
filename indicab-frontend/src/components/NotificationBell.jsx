import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaBell, FaCheckDouble, FaTrashAlt } from 'react-icons/fa';
import { fetchNotifications, markAsRead, markAllAsRead, addNotification } from '../features/notification/notificationSlice';
import { websocketService } from '../services/websocketService';
import { selectCurrentUser } from '../features/auth/authSelectors';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loading } = useSelector((state) => state.notification);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchNotifications());

      // Subscribe to real-time notifications
      const unsubscribe = websocketService.subscribeToNotifications(currentUser.id, (notification) => {
        dispatch(addNotification(notification));
        // Optional: show a toast here
      });

      return () => unsubscribe();
    }
  }, [currentUser, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors focus:outline-none"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <FaCheckDouble /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="spinner-border spinner-border-sm text-emerald-600 mb-2"></div>
                <p className="text-sm">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBell className="mx-auto mb-3 text-gray-200" size={32} />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-emerald-50/30' : ''}`}
                    onClick={() => !n.isRead && dispatch(markAsRead(n.id))}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        n.type === 'BOOKING' ? 'bg-blue-100 text-blue-700' :
                        n.type === 'PAYMENT' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {n.type}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <h4 className={`text-sm ${!n.isRead ? 'font-bold' : 'font-semibold'} text-gray-900 mb-1`}>{n.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                    
                    {!n.isRead && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-50 text-center bg-gray-50/50">
            <button className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
