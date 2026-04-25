import { sendOrderToTelegram } from './services/telegram.service.js';

const testOrder = {
    customer: {
        name: 'Test User',
        phone: '+998901234567',
        address: 'Test Address',
        comments: 'Test Comment'
    },
    items: [
        {
            name: 'Test Product',
            quantity: 1,
            price: 100000,
            selectedColor: 'Red',
            selectedSize: 'L'
        }
    ],
    totals: {
        subtotal: 100000,
        deliveryFee: 0,
        total: 100000
    }
};

console.log('Testing Telegram Service...');
sendOrderToTelegram(testOrder).then(result => {
    console.log('Result:', result);
});
