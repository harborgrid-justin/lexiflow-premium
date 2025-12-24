export const StringUtils = {
    levenshtein: (a: string, b: string): number => {
        const matrix = [];
        let i, j;

        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        // Increment along the first column of each row
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // Increment each column in the first row
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1  // deletion
                        )
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    },

    fuzzyMatch: (query: string, target: string, threshold = 3): boolean => {
        if (target.toLowerCase().includes(query.toLowerCase())) return true;
        return StringUtils.levenshtein(query.toLowerCase(), target.toLowerCase()) <= threshold;
    }
};
