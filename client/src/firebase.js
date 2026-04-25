import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyDWunJ1nkjfcI84ulgBHI2LYXHMlwAxgBU",
    authDomain: "luxe-store-ca6a2.firebaseapp.com",
    projectId: "luxe-store-ca6a2",
    storageBucket: "luxe-store-ca6a2.firebasestorage.app",
    messagingSenderId: "283777938224",
    appId: "1:283777938224:web:ef52f06cdba7f8bfd38ef5",
    measurementId: "G-MVPPPNMK2Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging = null;
try {
    messaging = getMessaging(app);
} catch (error) {
    console.log('FCM not supported in this browser');
}

const VAPID_KEY = 'BPS55YLCh7fEKt5HHx2che4WvpohHliOyA42UU_7O1Lf0K4h0oLs68eX12GT0o3ODrEFUg_NNXsUiJn7J98k9Ss';

// Request permission and get FCM token
export const requestNotificationPermission = async () => {
    try {
        if (!messaging) {
            console.log('Messaging not available');
            return null;
        }

        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            console.log('FCM Token:', token);
            return token;
        } else {
            console.log('Notification permission denied');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

// Listen for foreground messages
export const onMessageListener = () => {
    return new Promise((resolve) => {
        if (!messaging) {
            resolve(null);
            return;
        }

        onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
            resolve(payload);
        });
    });
};

export { app, messaging };
