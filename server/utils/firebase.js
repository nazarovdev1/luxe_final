import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let firebaseApp = null;

const initializeFirebase = () => {
    if (firebaseApp) return firebaseApp;

    try {
        // Try to read service account from config folder
        const serviceAccountPath = path.join(__dirname, '..', 'config', 'firebase-service-account.json');

        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });

            console.log('✅ Firebase Admin initialized successfully');
            return firebaseApp;
        } else {
            console.warn('⚠️ Firebase service account not found at:', serviceAccountPath);
            console.warn('Push notifications will not work until you add the service account JSON file.');
            return null;
        }
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error.message);
        return null;
    }
};

// Initialize on load
initializeFirebase();

/**
 * Send push notification to a single user
 * @param {string} fcmToken - User's FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 */
export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
    if (!firebaseApp) {
        console.warn('Firebase not initialized, skipping push notification');
        return { success: false, error: 'Firebase not initialized' };
    }

    if (!fcmToken) {
        console.warn('No FCM token provided');
        return { success: false, error: 'No FCM token' };
    }

    try {
        const message = {
            notification: {
                title,
                body
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            webpush: {
                notification: {
                    title,
                    body,
                    icon: '/logo192.png',
                    badge: '/logo192.png',
                    vibrate: [100, 50, 100]
                },
                fcmOptions: {
                    link: data.url || '/'
                }
            },
            token: fcmToken
        };

        const response = await admin.messaging().send(message);
        console.log('✅ Push notification sent:', response);
        return { success: true, messageId: response };
    } catch (error) {
        console.error('❌ Push notification error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send order status update notification
 * @param {string} fcmToken - User's FCM token  
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 */
export const sendOrderStatusNotification = async (fcmToken, orderId, status) => {
    const statusMessages = {
        'Kutilmoqda': {
            title: '🛒 Buyurtma qabul qilindi',
            body: `Buyurtmangiz #${orderId.slice(-6).toUpperCase()} qabul qilindi. Tez orada ko'rib chiqamiz.`
        },
        'Jarayonda': {
            title: '📦 Buyurtma tayyorlanmoqda',
            body: `Buyurtmangiz #${orderId.slice(-6).toUpperCase()} tayyorlanmoqda.`
        },
        'Yetkazilmoqda': {
            title: '🚚 Buyurtma yo\'lda!',
            body: `Buyurtmangiz #${orderId.slice(-6).toUpperCase()} yetkazib berilmoqda. Tez orada yetib boradi!`
        },
        'Yetkazildi': {
            title: '✅ Buyurtma yetkazildi',
            body: `Buyurtmangiz #${orderId.slice(-6).toUpperCase()} muvaffaqiyatli yetkazildi. Xaridingiz uchun rahmat!`
        },
        'Bekor qilindi': {
            title: '❌ Buyurtma bekor qilindi',
            body: `Buyurtmangiz #${orderId.slice(-6).toUpperCase()} bekor qilindi.`
        }
    };

    const message = statusMessages[status] || {
        title: 'Buyurtma yangilandi',
        body: `Buyurtmangiz #${orderId.slice(-6).toUpperCase()} holati: ${status}`
    };

    return sendPushNotification(fcmToken, message.title, message.body, {
        orderId,
        status,
        url: '/mobile/profile'
    });
};

export default {
    sendPushNotification,
    sendOrderStatusNotification
};
