export const SEARCH_CATEGORIES = [
    'all',
    'cases',
    'documents',
    'people',
    'dates',
    'tags'
] as const;

export type SearchCategory = typeof SEARCH_CATEGORIES[number];

export const SEARCH_CONFIG = {
    debounceDelay: 300,
    maxSuggestions: 10,
    syntaxHints: {
        trigger: ':',
        examples: ['case:', 'doc:', 'tag:']
    }
};
