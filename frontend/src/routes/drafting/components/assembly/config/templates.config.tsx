import { FileText, Mail, FileSignature, Scale, Building2, Users, BookOpen, Gavel } from 'lucide-react';

import { type DocumentTemplate } from '../types';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    name: 'Motion to Dismiss',
    description: 'Standard motion to dismiss with legal grounds and supporting arguments',
    icon: Gavel,
    category: 'Motions'
  },
  {
    name: 'Discovery Request',
    description: 'Interrogatories, requests for production, or requests for admission',
    icon: FileText,
    category: 'Discovery'
  },
  {
    name: 'Demand Letter',
    description: 'Formal demand letter outlining claims and settlement demands',
    icon: Mail,
    category: 'Correspondence'
  },
  {
    name: 'Contract Review Memo',
    description: 'Analysis and recommendations for contract terms and conditions',
    icon: FileSignature,
    category: 'Contracts'
  },
  {
    name: 'Legal Brief',
    description: 'Comprehensive legal brief with case law and statutory analysis',
    icon: BookOpen,
    category: 'Litigation'
  },
  {
    name: 'Settlement Agreement',
    description: 'Mutual settlement and release agreement template',
    icon: Scale,
    category: 'Settlement'
  },
  {
    name: 'Corporate Resolution',
    description: 'Board resolution or shareholder consent document',
    icon: Building2,
    category: 'Corporate'
  },
  {
    name: 'Witness Statement',
    description: 'Structured witness affidavit or declaration template',
    icon: Users,
    category: 'Evidence'
  }
];
