import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, AccordionItem } from '@/components/molecules';
import { ThemeProvider } from '@/providers/ThemeContext';
import React from "react";

/**
 * Accordion component for expandable content sections.
 */

const meta: Meta<typeof Accordion> = {
  title: 'Common/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Expandable accordion for organizing content into collapsible sections.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-white dark:bg-slate-900 max-w-2xl w-full">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem title="What is LexiFlow?">
        LexiFlow is an enterprise legal OS combining Case Management, Discovery, Legal Research, and Firm Operations.
      </AccordionItem>
      <AccordionItem title="How do I create a new case?">
        Navigate to Matter Management and click the "New Matter" button to create a new case with all required details.
      </AccordionItem>
      <AccordionItem title="Can I export documents?">
        Yes, documents can be exported in multiple formats including PDF, DOCX, and court-ready PDF-A formats.
      </AccordionItem>
    </Accordion>
  ),
};

export const SingleExpanded: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem title="What is LexiFlow?" defaultOpen>
        LexiFlow is an enterprise legal OS combining Case Management, Discovery, Legal Research, and Firm Operations.
      </AccordionItem>
      <AccordionItem title="How do I create a new case?">
        Navigate to Matter Management and click the "New Matter" button to create a new case with all required details.
      </AccordionItem>
      <AccordionItem title="Can I export documents?">
        Yes, documents can be exported in multiple formats including PDF, DOCX, and court-ready PDF-A formats.
      </AccordionItem>
    </Accordion>
  ),
};
