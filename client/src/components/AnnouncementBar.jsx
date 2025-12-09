import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const AnnouncementBar = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [announcement, setAnnouncement] = useState(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/announcement`);
                if (data.isActive && data.message) {
                    setAnnouncement(data);
                    setIsVisible(true);
                }
            } catch (error) {
                console.error("Failed to fetch announcement", error);
            }
        };

        fetchAnnouncement();
    }, []);

    if (!isVisible || !announcement) return null;

    return (
        <div className="bg-primary text-white py-2 px-4 shadow-sm z-[60] overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-block font-medium text-sm">
                {announcement.message}
            </div>
        </div>
    );
};

export default AnnouncementBar;
