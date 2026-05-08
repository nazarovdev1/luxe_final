import crypto from 'crypto';

/**
 * Verifies the authenticity of data received from Telegram Login Widget
 * @param {Object} authData - The data object received from Telegram
 * @param {string} botToken - Your Telegram Bot Token
 * @returns {boolean} - True if data is authentic
 */
export const verifyTelegramAuth = (authData, botToken) => {
    const { hash, ...data } = authData;
    
    // 1. Sort all fields alphabetically and join them into a string
    const dataCheckString = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('\n');

    // 2. SHA256 of the bot token is used as the secret key
    const secretKey = crypto.createHash('sha256')
        .update(botToken)
        .digest();

    // 3. HMAC-SHA256 of the data-check-string using the secret key
    const hmac = crypto.createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    // 4. Compare calculated hash with the received hash
    return hmac === hash;
};
