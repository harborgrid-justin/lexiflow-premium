import { type DocketEntry } from '@/types';

export const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

export const getPaddingDays = (date: Date): number[] => {
    const firstDay = getFirstDayOfMonth(date);
    return Array.from({ length: firstDay }, (_, i) => i);
};

export const getDaysArray = (date: Date): number[] => {
    const daysInMonth = getDaysInMonth(date);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};

export const getAllDeadlines = (entries: DocketEntry[]) => {
    // Ensure entries is an array before calling flatMap
    if (!Array.isArray(entries)) {
        console.warn('[getAllDeadlines] Expected array but got:', typeof entries, entries);
        return [];
    }
    return entries.flatMap(entry => 
        entry.triggersDeadlines?.map(dl => ({
          ...dl,
          caseId: entry.caseId,
          entryTitle: entry.title
        })) || []
    );
};

export const getDeadlinesForDay = (day: number, currentDate: Date, allDeadlines: unknown[]) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allDeadlines.filter((d): d is { date: string } => {
        return typeof d === 'object' && d !== null && 'date' in d && d.date === dateStr;
    });
};
