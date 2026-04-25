import React, { useState, useEffect } from 'react';
import { X, Info, CheckCircle, AlertTriangle, Bell } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3003/api';

const AnnouncementBanner = () => {
    const [announcement, setAnnouncement] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [showDelayed, setShowDelayed] = useState(false);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const response = await fetch(`${API_BASE}/announcements/active`);
                if (response.ok) {
                    const data = await response.json();
                    setAnnouncement(data);
                }
            } catch (error) {
                console.error('Error fetching announcement:', error);
            }
        };

        fetchAnnouncement();

        const timer = setTimeout(() => {
            setShowDelayed(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    if (!announcement || !isVisible || !announcement.isActive || !showDelayed) return null;

    const getStyles = (type) => {
        switch (type) {
            case 'success':
                return {
                    class: 'text-green-400 border-green-500/30',
                    icon: <CheckCircle className="h-3.5 w-3.5" />
                };
            case 'warning':
                return {
                    class: 'text-yellow-400 border-yellow-500/30',
                    icon: <AlertTriangle className="h-3.5 w-3.5" />
                };
            case 'error':
                return {
                    class: 'text-red-400 border-red-500/30',
                    icon: <Info className="h-3.5 w-3.5" />
                };
            default:
                return {
                    class: 'text-white border-accent/30',
                    icon: <Bell className="h-3.5 w-3.5" />
                };
        }
    };

    const styleData = getStyles(announcement.type);
    const styleClass = styleData.class;

    return (
        <div className={`relative bg-gray-900/95 backdrop-blur-md border-b ${styleClass} animate-slide-down`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                <div className="flex items-center justify-center relative">
                    {/* Icon and Text */}
                    <div className="flex items-center space-x-3 text-center">
                        <span className={`p-1 rounded-full bg-white/5 ${styleClass.split(' ')[0]}`}>
                            {styleData.icon}
                        </span>
                        <p className="text-sm font-medium tracking-wide text-gray-200">
                            {announcement.message}
                        </p>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
            {/* Animated gradient line at the bottom */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-50"></div>
        </div>
    );
};

export default AnnouncementBanner;
