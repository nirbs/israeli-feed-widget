import { useState, useEffect } from 'react';
import { NewsItem } from '@/services/rssService';

const CACHE_KEY = 'israeli-news-cache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

export const useOfflineNews = () => {
  const [cachedNews, setCachedNews] = useState<NewsItem[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Load cached news on startup
    loadCachedNews();

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedNews = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
        
        if (!isExpired) {
          setCachedNews(data);
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cached news:', error);
    }
  };

  const cacheNews = (news: NewsItem[]) => {
    try {
      const cacheData = {
        data: news,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setCachedNews(news);
    } catch (error) {
      console.error('Error caching news:', error);
    }
  };

  return {
    cachedNews,
    isOffline,
    cacheNews,
    loadCachedNews
  };
};