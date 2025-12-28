/**
 * Conversation API Mock Data
 * 
 * @deprecated MOCK DATA - DO NOT IMPORT DIRECTLY
 * Use DataService.correspondence.getConversations() instead.
 * This constant is only for seeding and testing purposes.
 * 
 * Backend alignment: /backend/src/communications/entities/conversation.entity.ts
 */

import type { Conversation, UserId } from '@/types';

/**
 * @deprecated MOCK DATA - Use DataService.correspondence instead
 */
export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv-1', name: 'John Doe (GC)', role: 'Client', status: 'online', unread: 2, isExternal: true,
        messages: [
            // FIX: Cast string to branded type UserId
            { id: 'm1', senderId: 'usr-client-doe' as UserId, text: 'Thanks for the update. Can we schedule a call for tomorrow?', timestamp: '2024-03-12T14:30:00Z', status: 'read' },
            { id: 'm2', senderId: 'me', text: 'Of course, I am available at 2pm EST.', timestamp: '2024-03-12T14:32:00Z', status: 'delivered' },
            // FIX: Cast string to branded type UserId
            { id: 'm3', senderId: 'usr-client-doe' as UserId, text: 'Perfect.', timestamp: '2024-03-12T14:35:00Z', status: 'read' }
        ]
    },
    {
        id: 'conv-2', name: 'Litigation Team A', role: 'Internal Group', status: 'online', unread: 0, isExternal: false,
        messages: [
            // FIX: Cast string to branded type UserId
            { id: 'm4', senderId: 'usr-partner-alex' as UserId, text: 'Team, please review the latest filing from opposing counsel in Martinez v. TechCorp', timestamp: '2024-03-11T10:00:00Z' },
        ],
        draft: 'Okay, I will review it now.'
    },
    // NEW for CaseMessages refactor
    {
        id: 'conv-case-25-1229', name: 'Case Thread: 25-1229', role: 'Case Team', status: 'online', unread: 1, isExternal: true,
        messages: [
             {
              id: 'cm1', senderId: 'usr-partner-alex' as UserId,
              text: `Team, regarding the appeal for Justin Saadein-Morales, we need to expedite the discovery review. The judge is pushing for a conference next week.`,
              timestamp: '2025-09-20T09:30:00Z', isPrivileged: true
            },
            {
              id: 'cm2', senderId: 'usr-para-sarah' as UserId,
              text: 'Understood. I have uploaded the latest production set to the Discovery center. Waiting on OCR.',
              timestamp: '2025-09-20T10:15:00Z', isPrivileged: true, attachments: [{name: 'Production_Set_004.pdf', type: 'doc', size: '2.1MB'}]
            },
            {
              id: 'cm3', senderId: 'usr-admin-justin' as UserId,
              text: 'I found the old email archives you asked for. How should I send them securely?',
              timestamp: '2025-09-21T08:00:00Z', isPrivileged: true
            }
        ]
    }
];
