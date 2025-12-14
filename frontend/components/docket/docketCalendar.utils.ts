import { DocketEntry } from '../../types';

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
    return entries.flatMap(entry => 
        entry.triggersDeadlines?.map(dl => ({
          ...dl,
          caseId: entry.caseId,
          entryTitle: entry.title
        })) || []
    );
};

export const getDeadlinesForDay = (day: number, currentDate: Date, allDeadlines: any[]) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allDeadlines.filter(d => d.date === dateStr);
};
