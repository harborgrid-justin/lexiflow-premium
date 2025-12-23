#!/bin/bash

# Fix property initializer errors by adding definite assignment assertion (!)
# This script processes TypeScript TS2564 errors

cd /home/user/lexiflow-premium/backend

# Get all files with TS2564 errors
npx tsc --noEmit 2>&1 | grep "TS2564" | while read -r line; do
    # Extract file path and line number
    file=$(echo "$line" | cut -d'(' -f1)
    linenum=$(echo "$line" | cut -d'(' -f2 | cut -d',' -f1)

    if [ -f "$file" ] && [ -n "$linenum" ]; then
        # Get the line content
        current_line=$(sed -n "${linenum}p" "$file")

        # Check if it's a property declaration (not already with ! or ?)
        if [[ "$current_line" =~ ^[[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*:[[:space:]] ]] && \
           [[ ! "$current_line" =~ \! ]] && \
           [[ ! "$current_line" =~ \? ]]; then
            # Add ! before the colon
            sed -i "${linenum}s/\([a-zA-Z_][a-zA-Z0-9_]*\):/\1!:/" "$file"
            echo "Fixed: $file:$linenum"
        fi
    fi
done

echo "Property initializer fixes completed!"
