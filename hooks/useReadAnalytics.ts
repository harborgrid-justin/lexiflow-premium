import { useEffect, useRef, useState } from 'react';

interface ReadAnalyticsOptions {
    thresholdMs?: number;
    onRead?: (id: string, duration: number) => void;
}

export const useReadAnalytics = (id: string, options: ReadAnalyticsOptions = {}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isRead, setIsRead] = useState(false);
    const [duration, setDuration] = useState(0);
    
    // Internal state to track timing
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);
    const totalDurationRef = useRef(0);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startTimeRef.current = Date.now();
                    // Start tick
                    timerRef.current = window.setInterval(() => {
                        if (startTimeRef.current) {
                           const diff = Date.now() - startTimeRef.current;
                           // Only count up to 60s per session to prevent idle skew
                           if (diff < 60000) {
                               setDuration(d => d + 1);
                               totalDurationRef.current += 1;
                           }
                        }
                    }, 1000);
                } else {
                    if (timerRef.current) clearInterval(timerRef.current);
                    
                    if (startTimeRef.current) {
                        const sessionDuration = Date.now() - startTimeRef.current;
                        if (sessionDuration > (options.thresholdMs || 3000) && !isRead) {
                            setIsRead(true);
                            if (options.onRead) options.onRead(id, sessionDuration);
                        }
                        startTimeRef.current = null;
                    }
                }
            });
        }, { threshold: 0.5 }); // 50% visibility

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [id, options.thresholdMs, isRead]);

    return { ref, isRead, duration };
};