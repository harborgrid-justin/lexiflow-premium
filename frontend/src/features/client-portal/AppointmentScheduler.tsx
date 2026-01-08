import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Plus,
  X,
} from 'lucide-react';

interface Appointment {
  id: string;
  attorneyName?: string;
  datetime: Date;
  durationMinutes: number;
  appointmentType: string;
  meetingMethod: string;
  location?: string;
  status: string;
  meetingLink?: string;
  phoneNumber?: string;
  notes?: string;
  clientNotes?: string;
}

interface AppointmentSchedulerProps {
  portalUserId: string;
}

export default function AppointmentScheduler({ portalUserId }: AppointmentSchedulerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [portalUserId, filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ portalUserId });
      if (filter === 'upcoming') {
        params.append('startDate', new Date().toISOString());
        params.append('status', 'scheduled,confirmed');
      } else if (filter === 'past') {
        params.append('endDate', new Date().toISOString());
      }
      const response = await fetch(`/api/client-portal/appointments?${params}`);
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await fetch(`/api/client-portal/appointments/${appointmentId}?portalUserId=${portalUserId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Client requested cancellation' }),
      });
      fetchAppointments();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await fetch(
        `/api/client-portal/appointments/${appointmentId}/confirm?portalUserId=${portalUserId}`,
        { method: 'POST' }
      );
      fetchAppointments();
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-2 text-gray-600">Schedule and manage your appointments</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setFilter('upcoming')}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              filter === 'upcoming'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              filter === 'past'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={() => handleCancelAppointment(appointment.id)}
              onConfirm={() => handleConfirmAppointment(appointment.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No appointments found</p>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleAppointmentModal
          portalUserId={portalUserId}
          onClose={() => setShowScheduleModal(false)}
          onScheduled={() => {
            setShowScheduleModal(false);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: () => void;
  onConfirm: () => void;
}

function AppointmentCard({ appointment, onCancel, onConfirm }: AppointmentCardProps) {
  const getMeetingIcon = (method: string) => {
    switch (method) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-green-600" />;
      case 'in_person':
        return <MapPin className="w-5 h-5 text-purple-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: { text: 'Scheduled', class: 'bg-blue-100 text-blue-800' },
      confirmed: { text: 'Confirmed', class: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Cancelled', class: 'bg-red-100 text-red-800' },
      completed: { text: 'Completed', class: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[status as keyof typeof badges] || badges.scheduled;

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg">{getMeetingIcon(appointment.meetingMethod)}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {appointment.appointmentType.replace('_', ' ').toUpperCase()}
            </h3>
            <p className="text-sm text-gray-600">
              with {appointment.attorneyName || 'Attorney'}
            </p>
          </div>
        </div>
        {getStatusBadge(appointment.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(appointment.datetime).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>
            {new Date(appointment.datetime).toLocaleTimeString()} ({appointment.durationMinutes}{' '}
            min)
          </span>
        </div>
        {appointment.location && (
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{appointment.location}</span>
          </div>
        )}
      </div>

      {appointment.meetingLink && (
        <div className="mb-4">
          <a
            href={appointment.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Join Meeting
          </a>
        </div>
      )}

      {appointment.clientNotes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{appointment.clientNotes}</p>
        </div>
      )}

      {appointment.status === 'scheduled' && (
        <div className="flex items-center space-x-2">
          <button
            onClick={onConfirm}
            className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Confirm</span>
          </button>
          <button
            onClick={onCancel}
            className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface ScheduleAppointmentModalProps {
  portalUserId: string;
  onClose: () => void;
  onScheduled: () => void;
}

function ScheduleAppointmentModal({
  portalUserId,
  onClose,
  onScheduled,
}: ScheduleAppointmentModalProps) {
  const [formData, setFormData] = useState({
    attorneyId: '',
    datetime: '',
    appointmentType: 'consultation',
    meetingMethod: 'video',
    notes: '',
  });
  const [scheduling, setScheduling] = useState(false);

  const handleSchedule = async () => {
    try {
      setScheduling(true);
      await fetch(`/api/client-portal/appointments?portalUserId=${portalUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      onScheduled();
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Schedule Appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date and Time
            </label>
            <input
              type="datetime-local"
              value={formData.datetime}
              onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Type
            </label>
            <select
              value={formData.appointmentType}
              onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="consultation">Consultation</option>
              <option value="review">Review</option>
              <option value="phone_call">Phone Call</option>
              <option value="video_conference">Video Conference</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Method
            </label>
            <select
              value={formData.meetingMethod}
              onChange={(e) => setFormData({ ...formData, meetingMethod: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="video">Video</option>
              <option value="phone">Phone</option>
              <option value="in_person">In Person</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={scheduling || !formData.datetime}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {scheduling ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
