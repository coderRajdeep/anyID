import { useState, useEffect } from 'react';
import { IdentificationResultType } from '../types';

export interface HistoryItem {
    id: string;
    timestamp: number;
    imageUrl: string;
    result: IdentificationResultType;
    isFavorite: boolean;
}

export const useHistory = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('anyID_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const addToHistory = (item: HistoryItem) => {
        setHistory((prev) => {
            // Check if item already exists (by some criteria) or just add new
            // We limit to 10 items to prevent localStorage quota exceeded errors with base64 images
            const newHistory = [item, ...prev].slice(0, 10);
            try {
                localStorage.setItem('anyID_history', JSON.stringify(newHistory));
            } catch (e) {
                console.error("Storage full", e);
                // If full, maybe remove oldest and try again?
                // For now, just ignore
            }
            return newHistory;
        });
    };

    const toggleFavorite = (id: string) => {
        setHistory((prev) => {
            const newHistory = prev.map(item =>
                item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
            );
            localStorage.setItem('anyID_history', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const deleteItem = (id: string) => {
        setHistory((prev) => {
            const newHistory = prev.filter(item => item.id !== id);
            localStorage.setItem('anyID_history', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('anyID_history');
    };

    return { history, addToHistory, toggleFavorite, deleteItem, clearHistory };
};
