"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

/**
 * Collapsible - Expandable/collapsible content section
 * Built on Radix UI Collapsible for smooth animations and accessibility
 *
 * @example
 * ```tsx
 * import {
 *   Collapsible,
 *   CollapsibleTrigger,
 *   CollapsibleContent,
 * } from "@/components/ui/shadcn/collapsible"
 *
 * // Basic usage
 * <Collapsible>
 *   <CollapsibleTrigger>Click to expand</CollapsibleTrigger>
 *   <CollapsibleContent>
 *     This content can be expanded and collapsed
 *   </CollapsibleContent>
 * </Collapsible>
 *
 * // Controlled state
 * const [isOpen, setIsOpen] = useState(false)
 *
 * <Collapsible open={isOpen} onOpenChange={setIsOpen}>
 *   <CollapsibleTrigger asChild>
 *     <button className="flex items-center justify-between w-full">
 *       <span>Case Details</span>
 *       <ChevronDown className={cn(
 *         "h-4 w-4 transition-transform",
 *         isOpen && "rotate-180"
 *       )} />
 *     </button>
 *   </CollapsibleTrigger>
 *   <CollapsibleContent>
 *     <div className="space-y-2 pt-4">
 *       <p>Case Number: #12345</p>
 *       <p>Status: Active</p>
 *       <p>Filed: 2024-01-15</p>
 *     </div>
 *   </CollapsibleContent>
 * </Collapsible>
 *
 * // FAQ section
 * <div className="space-y-2">
 *   {faqs.map((faq) => (
 *     <Collapsible key={faq.id} className="border rounded-lg p-4">
 *       <CollapsibleTrigger className="flex w-full items-center justify-between">
 *         <span className="font-medium">{faq.question}</span>
 *         <ChevronDown className="h-4 w-4" />
 *       </CollapsibleTrigger>
 *       <CollapsibleContent className="pt-4 text-slate-600">
 *         {faq.answer}
 *       </CollapsibleContent>
 *     </Collapsible>
 *   ))}
 * </div>
 * ```
 */
const Collapsible = CollapsiblePrimitive.Root;

/**
 * CollapsibleTrigger - Button that toggles the collapsible content
 * Can be used with asChild to render as a custom element
 */
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

/**
 * CollapsibleContent - The content section that expands/collapses
 * Automatically animates height transitions
 */
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
