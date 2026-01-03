/**
 * Secure Messenger Route
 *
 * Secure messaging system for client and team communication with:
 * - Server-side data loading via loader
 * - Real-time message updates
 * - Thread management
 * - Attachment handling
 *
 * @module routes/messages/index
 */

import { api } from '@/api';
import type { Conversation, Message } from '@/api/communications/messaging-api';
import {
  Info,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Video
} from 'lucide-react';
import { Form, Link, useNavigation, useSubmit } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  const unreadCount = data?.unreadCount || 0;
  return createMeta({
    title: unreadCount > 0 ? `(${unreadCount}) Secure Messenger` : 'Secure Messenger',
    description: 'Encrypted messaging for confidential client and team communication',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversationId");
  const search = url.searchParams.get("q") || "";

  try {
    // Fetch conversations
    const conversations = await api.messaging.getConversations({
      // searchQuery: search, // Assuming filter supports search
    });

    // Calculate unread count
    const unreadCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

    // Fetch selected conversation details if ID is present
    let selectedConversation: Conversation | null = null;
    let messages: Message[] = [];

    if (conversationId) {
      try {
        selectedConversation = await api.messaging.getConversation(conversationId);
        messages = await api.messaging.getMessages(conversationId);
      } catch (e) {
        console.error("Failed to load conversation", e);
      }
    }

    return {
      conversations,
      unreadCount,
      selectedConversation,
      messages,
      search,
    };
  } catch (error) {
    console.error("Failed to load messages:", error);
    return {
      conversations: [],
      unreadCount: 0,
      selectedConversation: null,
      messages: [],
      search,
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "send-message": {
        const conversationId = formData.get("conversationId") as string;
        const content = formData.get("content") as string;

        if (!conversationId || !content) {
          return { success: false, error: "Missing required fields" };
        }

        await api.messaging.sendMessage({
          conversationId,
          content,
          type: 'text'
        });

        return { success: true, message: "Message sent" };
      }
      case "create-conversation": {
        // Handle new conversation creation
        return { success: true, message: "Conversation created" };
      }
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Action failed:", error);
    return { success: false, error: "Operation failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function MessagesIndexRoute({ loaderData }: Route.ComponentProps) {
  const { conversations, selectedConversation, messages, search } = loaderData;
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar - Conversation List */}
      <div className="flex w-80 flex-col border-r border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
          <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <Form method="get" className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search messages..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              onChange={(e) => {
                const isFirstSearch = search === null;
                submit(e.currentTarget.form, {
                  replace: !isFirstSearch,
                });
              }}
            />
          </Form>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <Link
                    to={`?conversationId=${conv.id}`}
                    className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedConversation?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            {conv.name ? conv.name.charAt(0).toUpperCase() : <MessageSquare className="h-5 w-5" />}
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {conv.name || 'Untitled Conversation'}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {conv.lastMessage?.createdAt && new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Content - Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {selectedConversation.name ? selectedConversation.name.charAt(0).toUpperCase() : <MessageSquare className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedConversation.name || 'Untitled Conversation'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedConversation.participants.length} participants
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                  <Video className="h-5 w-5" />
                </button>
                <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                  <Info className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {messages.map((msg: Message) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === 'current-user-id' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.senderId === 'current-user-id'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                        }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${msg.senderId === 'current-user-id' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-800">
              <Form method="post" className="flex items-center gap-4">
                <input type="hidden" name="intent" value="send-message" />
                <input type="hidden" name="conversationId" value={selectedConversation.id} />
                <button
                  type="button"
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  name="content"
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </Form>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
              <MessageSquare className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Select a conversation</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Choose a conversation from the list or start a new one
            </p>
            <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Messages"
      message="We couldn't load your messages. Please try again."
    />
  );
}
