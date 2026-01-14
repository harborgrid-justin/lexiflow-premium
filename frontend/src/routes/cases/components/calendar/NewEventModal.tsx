/**
 * @module components/calendar/NewEventModal
 * @category Calendar
 * @description Modal for creating new calendar events with validation.
 */

import { useState } from 'react';
import { Modal } from '@/shared/ui/molecules/Modal/Modal';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { DataService } from '@/services/data/data-service.service';
import { queryClient } from '@/hooks';
import { Calendar, Clock, MapPin, FileText, Tag } from 'lucide-react';
import type { CalendarEventType } from '@/types';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EventFormData {
  title: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
  caseId: string;
}

const EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: 'Hearing' as CalendarEventType, label: 'Hearing' },
  { value: 'Deadline' as CalendarEventType, label: 'Deadline' },
  { value: 'Meeting' as CalendarEventType, label: 'Meeting' },
  { value: 'Filing' as CalendarEventType, label: 'Filing' },
  { value: 'Reminder' as CalendarEventType, label: 'Reminder' },
];

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    eventType: 'Meeting' as CalendarEventType,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16), // +1 hour
    description: '',
    location: '',
    caseId: '',
  });

  const handleChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Event title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await DataService.calendar.create({
        title: formData.title,
        eventType: formData.eventType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        description: formData.description || undefined,
        location: formData.location || undefined,
        caseId: formData.caseId || undefined,
      });

      // Invalidate calendar queries to refresh the data
      await queryClient.invalidate(['calendar']);
      
      onClose();
    } catch (err) {
      console.error('[NewEventModal] Failed to create event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter event title"
            required
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <Tag className="inline h-4 w-4 mr-1" />
            Event Type *
          </label>
          <select
            value={formData.eventType}
            onChange={(e) => handleChange('eventType', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Clock className="inline h-4 w-4 mr-1" />
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <MapPin className="inline h-4 w-4 mr-1" />
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter location (optional)"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <FileText className="inline h-4 w-4 mr-1" />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Enter event description (optional)"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
