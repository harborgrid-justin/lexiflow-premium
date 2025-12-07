
export const SQL_KEYWORDS = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 
    'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET', 'AS', 'CASE', 'WHEN', 
    'THEN', 'ELSE', 'END', 'AND', 'OR', 'NOT', 'IN', 'IS NULL', 'IS NOT NULL'
];

export const SqlHelpers = {
    /**
     * Formats a raw SQL string with proper indentation and capitalization.
     */
    formatQuery: (query: string): string => {
        let formatted = query;
        SQL_KEYWORDS.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b`, 'gi');
            formatted = formatted.replace(regex, kw.toUpperCase());
        });
        
        formatted = formatted
            .replace(/SELECT/g, '\nSELECT')
            .replace(/FROM/g, '\nFROM')
            .replace(/WHERE/g, '\nWHERE')
            .replace(/GROUP BY/g, '\nGROUP BY')
            .replace(/ORDER BY/g, '\nORDER BY')
            .trim();
            
        return formatted;
    },

    /**
     * Generates a SQL condition string from structured rule data.
     */
    generateConditionSql: (conditions: { field: string, operator: string, value: string }[]): string => {
        if (conditions.length === 0) return '-- No conditions defined';
        const clauses = conditions.map(c => 
          `${c.field || 'field'} ${c.operator} ${c.value ? `'${c.value}'` : 'value'}`
        );
        return `SELECT * FROM dataset\nWHERE ${clauses.join('\n  AND ')};`;
    }
};
