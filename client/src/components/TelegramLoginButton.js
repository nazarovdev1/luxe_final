import React, { useEffect, useRef } from 'react';
import useProductService from '../server/server';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TelegramLoginButton = ({ botName, buttonSize = 'large', cornerRadius = 12 }) => {
    const scriptRef = useRef(null);
    const { setAuthData } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Define the global callback function that Telegram will call
        window.onTelegramAuth = async (user) => {
            try {
                const response = await fetch('/api/auth/telegram-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });

                const result = await response.json();

                if (result.success) {
                    // Log in using the same logic as normal login
                    setAuthData(result.data, result.data.token);
                    toast.success(`Xush kelibsiz, ${result.data.username}!`);
                    navigate('/');
                } else {
                    toast.error(result.message || 'Telegram orqali kirishda xatolik');
                }
            } catch (error) {
                console.error('Telegram auth error:', error);
                toast.error('Server bilan bog\'lanishda xatolik');
            }
        };

        // Create and inject the Telegram script
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', botName || 'luxx_uz_bot'); // Replace with your bot username
        script.setAttribute('data-size', buttonSize);
        script.setAttribute('data-radius', cornerRadius);
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        script.async = true;

        scriptRef.current.appendChild(script);

        return () => {
            // Cleanup: remove global callback and script content
            if (scriptRef.current) {
                scriptRef.current.innerHTML = '';
            }
            delete window.onTelegramAuth;
        };
    }, [botName, buttonSize, cornerRadius, setAuthData, navigate]);

    return (
        <div className="flex justify-center my-4">
            <div ref={scriptRef} id="telegram-login-container"></div>
        </div>
    );
};

export default TelegramLoginButton;
