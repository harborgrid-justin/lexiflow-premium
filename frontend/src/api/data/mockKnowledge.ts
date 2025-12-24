import { WikiArticle, Precedent, QAItem, DocumentId } from '@/types';

export const MOCK_WIKI_ARTICLES: WikiArticle[] = [
  {
    id: 'ca-employment',
    title: 'California Employment Litigation Playbook',
    category: 'Litigation',
    content: `
      <h2>I. Initial Case Assessment</h2>
      <p>Upon receiving a new employment matter in California, immediately conduct a thorough conflict check... C.C.P. § 170.6 challenges must be filed within 10 days of the judge's assignment.</p>
      
      <h2>II. Pleadings</h2>
      <p>Complaints must be factually specific to survive demurrer under the heightened pleading standards post-Iqbal/Twombly, which California courts have increasingly adopted.</p>

      <h2>III. Discovery</h2>
      <p>Key deadlines:</p>
      <ul>
        <li>Initial Disclosures: Per FRCP 26(a)(1) or state equivalent.</li>
        <li>Demand for Inspection of Documents: No numerical limit, but must be proportional.</li>
        <li>Depositions: 1 per person, 7-hour limit.</li>
      </ul>
    `,
    lastUpdated: '2024-03-10',
    isFavorite: true,
    author: 'Sarah Miller',
  },
  {
    id: 'billing-codes',
    title: 'Standard Billing Codes & Rates 2024',
    category: 'Finance',
    content: `
      <h3>Standard Rates</h3>
      <p>Senior Partner: $850/hr<br/>Partner: $700/hr<br/>Senior Associate: $550/hr<br/>Associate: $450/hr<br/>Paralegal: $250/hr</p>
      
      <h3>Common Task Codes (UTBMS)</h3>
      <ul>
        <li>L110: Fact Investigation/Development</li>
        <li>L120: Factual Research</li>
        <li>L310: Motion to Dismiss</li>
        <li>L420: Depositions</li>
      </ul>
    `,
    lastUpdated: '2024-01-15',
    isFavorite: false,
    author: 'Finance Team',
  },
];

export const MOCK_PRECEDENTS: Precedent[] = [
    {
      id: 'prec-1',
      title: 'Successful Motion for Summary Judgment (CA)',
      type: 'Motion',
      description: 'Based on lack of triable issue of material fact in a contract dispute case.',
      tag: 'success',
      docId: 'doc-msj-template' as DocumentId,
    },
    {
      id: 'prec-2',
      title: '9th Circuit Appellate Brief (Affirmed)',
      type: 'Appeal',
      description: 'Example of a successful appellate brief focusing on standard of review.',
      tag: 'success',
      docId: 'doc-appeal-template' as DocumentId,
    },
    {
      id: 'prec-3',
      title: 'Notice of Deposition (Complex ESI)',
      type: 'Discovery',
      description: 'Template includes specific requests for ESI protocols and search terms.',
      tag: 'info',
      docId: 'doc-depo-template' as DocumentId,
    },
];

export const MOCK_QA_ITEMS: QAItem[] = [
    {
      id: 'qa-1',
      question: 'What is the current standard for piercing the corporate veil in Delaware?',
      asker: 'James Doe',
      time: '2 days ago',
      answer: 'The Delaware Supreme Court requires a showing of fraud or that the corporation is a mere instrumentality or alter ego of its owner. See Wallace v. Wood.',
      answerer: 'Alexandra H.',
      role: 'Senior Partner',
      verified: true
    },
     {
      id: 'qa-2',
      question: 'Can we file a motion in limine to exclude expert testimony after the deadline?',
      asker: 'Sarah Jenkins',
      time: '5 days ago',
      answer: 'Generally no, unless you can show good cause for the delay under FRCP 16(b)(4). It is a high bar.',
      answerer: 'Alexandra H.',
      role: 'Senior Partner',
      verified: true
    }
];
