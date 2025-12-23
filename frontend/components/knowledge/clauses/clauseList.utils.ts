import { Clause } from '../../../types';

export const filterClauses = (clauses: Clause[], searchTerm: string): Clause[] => {
    const lowercasedTerm = searchTerm.toLowerCase();
    return clauses.filter(c =>
        (c.name || '').toLowerCase().includes(lowercasedTerm) ||
        c.category.toLowerCase().includes(lowercasedTerm)
    );
};
