import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { requestNotificationPermission, onMessageListener } from '../firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [fcmToken, setFcmToken] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [isSupported, setIsSupported] = useState(false);

    // Check if notifications are supported
    useEffect(() => {
        const supported = 'Notification' in window && 'serviceWorker' in navigator;
        setIsSupported(supported);

        if (supported) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    // Request permission and save token
    const enableNotifications = useCallback(async () => {
        if (!isSupported) {
            toast.error("Bu brauzer xabarnomalarni qo'llab-quvvatlamaydi");
            return false;
        }

        try {
            const token = await requestNotificationPermission();

            if (token) {
                setFcmToken(token);
                setNotificationPermission('granted');

                // Save token to backend
                if (isAuthenticated) {
                    await saveFcmTokenToServer(token);
                }

                toast.success("Xabarnomalar yoqildi!");
                return true;
            } else {
                toast.error("Xabarnomalar rad etildi");
                setNotificationPermission('denied');
                return false;
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
            toast.error("Xatolik yuz berdi");
            return false;
        }
    }, [isSupported, isAuthenticated]);

    // Save FCM token to server
    const saveFcmTokenToServer = async (token) => {
        try {
            const authToken = localStorage.getItem('token');
            if (!authToken) return;

            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api'}/auth/fcm-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ fcmToken: token })
            });

            const result = await response.json();
            if (result.success) {
                console.log('FCM token saved to server');
            }
        } catch (error) {
            console.error('Error saving FCM token:', error);
        }
    };

    // Listen for foreground messages
    useEffect(() => {
        if (!isSupported || notificationPermission !== 'granted') return;

        const setupMessageListener = async () => {
            try {
                const payload = await onMessageListener();
                if (payload) {
                    // Show in-app notification
                    toast.custom((t) => (
                        <div
                            className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                            max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto 
                            flex ring-1 ring-black ring-opacity-5`}
                        >
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <img className="h-10 w-10 rounded-full" src="/logo192.png" alt="" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {payload.notification?.title || 'Luxe Store'}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {payload.notification?.body}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ), { duration: 5000 });

                    // Recursive call to continue listening
                    setupMessageListener();
                }
            } catch (error) {
                console.error('Message listener error:', error);
            }
        };

        setupMessageListener();
    }, [isSupported, notificationPermission]);

    // Auto-save token when user logs in
    useEffect(() => {
        if (isAuthenticated && fcmToken) {
            saveFcmTokenToServer(fcmToken);
        }
    }, [isAuthenticated, fcmToken]);

    const value = {
        fcmToken,
        notificationPermission,
        isSupported,
        enableNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
