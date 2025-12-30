import { cn } from '@/utils/cn';

export const getSuccessStyles = (theme: unknown) => cn((theme as any).status.success.text, (theme as any).status.success.bg, (theme as any).status.success.border);
