#!/bin/bash

# Fix unused import errors by removing them
# This script processes TypeScript TS6133 errors for imports

cd /home/user/lexiflow-premium/backend

# Get all files with unused import errors
npx tsc --noEmit 2>&1 | grep "TS6133" | grep "is declared but its value is never read" | while read -r line; do
    # Extract file path, line number, and variable name
    file=$(echo "$line" | cut -d'(' -f1)
    linenum=$(echo "$line" | cut -d'(' -f2 | cut -d',' -f1)
    varname=$(echo "$line" | grep -oP "'\K[^']+(?=' is declared)")

    if [ -f "$file" ] && [ -n "$linenum" ] && [ -n "$varname" ]; then
        # Get the line content
        current_line=$(sed -n "${linenum}p" "$file")

        # Check if it's an import statement
        if [[ "$current_line" =~ ^import ]]; then
            # Try to remove the unused import
            # Case 1: Single import
            if [[ "$current_line" =~ ^import[[:space:]]+${varname}[[:space:]]+from ]]; then
                sed -i "${linenum}d" "$file"
                echo "Removed import: $file:$linenum ($varname)"
            # Case 2: Named import in a list
            elif [[ "$current_line" =~ \{.*${varname}.*\} ]]; then
                # Remove from the list
                sed -i "${linenum}s/${varname}[[:space:]]*,[[:space:]]*//; ${linenum}s/,[[:space:]]*${varname}[[:space:]]*//; ${linenum}s/{[[:space:]]*${varname}[[:space:]]*}/{}/" "$file"
                # If the import line now has empty braces, remove it
                if grep -q "import[[:space:]]*{[[:space:]]*}[[:space:]]*from" "$file"; then
                    sed -i "${linenum}d" "$file"
                fi
                echo "Removed from import list: $file:$linenum ($varname)"
            fi
        else
            # For unused variables/parameters, prefix with underscore
            sed -i "${linenum}s/\b${varname}\b/_${varname}/g" "$file"
            echo "Prefixed with _: $file:$linenum ($varname)"
        fi
    fi
done

echo "Unused import/variable fixes completed!"
