import React, { useState, useEffect } from 'react';
import {
  Mail,
  MailOpen,
  Send,
  Paperclip,
  Search,
  Filter,
  Archive,
  Trash2,
  Reply,
  X,
  CheckCircle,
} from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  body: string;
  senderType: string;
  senderName?: string;
  sentAt: Date;
  read: boolean;
  messageType: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
}

interface SecureInboxProps {
  portalUserId: string;
}

export default function SecureInbox({ portalUserId }: SecureInboxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [portalUserId, filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ portalUserId });
      if (filter !== 'all') {
        params.append('read', filter === 'read' ? 'true' : 'false');
      }
      const response = await fetch(`/api/client-portal/messages?${params}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      await markAsRead(message.id);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/client-portal/messages/${messageId}/read?portalUserId=${portalUserId}`, {
        method: 'PUT',
      });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
      );
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleArchive = async (messageId: string) => {
    try {
      await fetch(`/api/client-portal/messages/${messageId}/archive?portalUserId=${portalUserId}`, {
        method: 'PUT',
      });
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      setSelectedMessage(null);
    } catch (error) {
      console.error('Failed to archive message:', error);
    }
  };

  const filteredMessages = messages.filter((msg) =>
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-900">Secure Inbox</h1>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Send className="w-4 h-4" />
          <span>Compose</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <MessageListItem
                  key={message.id}
                  message={message}
                  isSelected={selectedMessage?.id === message.id}
                  onClick={() => handleSelectMessage(message)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No messages found</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
          {selectedMessage ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedMessage.subject}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      From: {selectedMessage.senderName || 'Attorney'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedMessage.sentAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowReply(true)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Reply"
                    >
                      <Reply className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleArchive(selectedMessage.id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      title="Archive"
                    >
                      <Archive className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {selectedMessage.messageType !== 'general' && (
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {selectedMessage.messageType.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.body}</p>
                </div>
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Attachments</h3>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <Paperclip className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{attachment.filename}</span>
                          <span className="text-xs text-gray-500">
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <MailOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Select a message to view</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeMessageModal
          portalUserId={portalUserId}
          onClose={() => setShowCompose(false)}
          onSent={() => {
            setShowCompose(false);
            fetchMessages();
          }}
        />
      )}

      {/* Reply Modal */}
      {showReply && selectedMessage && (
        <ReplyMessageModal
          portalUserId={portalUserId}
          originalMessage={selectedMessage}
          onClose={() => setShowReply(false)}
          onSent={() => {
            setShowReply(false);
            fetchMessages();
          }}
        />
      )}
    </div>
  );
}

interface MessageListItemProps {
  message: Message;
  isSelected: boolean;
  onClick: () => void;
}

function MessageListItem({ message, isSelected, onClick }: MessageListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
      } ${!message.read ? 'bg-blue-50 bg-opacity-30' : ''}`}
    >
      <div className="flex items-start space-x-3">
        {message.read ? (
          <MailOpen className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
        ) : (
          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${!message.read ? 'font-semibold' : 'font-medium'}`}>
            {message.subject}
          </p>
          <p className="text-xs text-gray-500 truncate mt-1">{message.body.substring(0, 60)}...</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(message.sentAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ComposeMessageModalProps {
  portalUserId: string;
  onClose: () => void;
  onSent: () => void;
}

function ComposeMessageModal({ portalUserId, onClose, onSent }: ComposeMessageModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    try {
      setSending(true);
      await fetch(`/api/client-portal/messages?portalUserId=${portalUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      onSent();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Compose Message</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject || !body}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ReplyMessageModalProps {
  portalUserId: string;
  originalMessage: Message;
  onClose: () => void;
  onSent: () => void;
}

function ReplyMessageModal({ portalUserId, originalMessage, onClose, onSent }: ReplyMessageModalProps) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleReply = async () => {
    try {
      setSending(true);
      await fetch(`/api/client-portal/messages/${originalMessage.id}/reply?portalUserId=${portalUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      onSent();
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Reply to: {originalMessage.subject}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            placeholder="Your reply..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleReply}
            disabled={sending || !body}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Reply className="w-4 h-4" />
            <span>{sending ? 'Sending...' : 'Send Reply'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
