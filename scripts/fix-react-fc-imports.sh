#!/bin/bash
# Quick wrapper for fix-react-fc-imports.py

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/fix-react-fc-imports.py"

echo "🔧 React.FC Import Fixer"
echo "========================"
echo ""

# Show usage if no args
if [ $# -eq 0 ]; then
    echo "Usage:"
    echo "  $0 preview-quick    # Preview quick fix (just add imports)"
    echo "  $0 apply-quick      # Apply quick fix"
    echo "  $0 preview-full     # Preview full fix (add imports + convert to functions)"
    echo "  $0 apply-full       # Apply full fix"
    echo ""
    exit 1
fi

case "$1" in
    preview-quick)
        python3 "$PYTHON_SCRIPT" --mode quick --dry-run
        ;;
    apply-quick)
        echo "⚠️  This will modify 250+ files. Continue? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            python3 "$PYTHON_SCRIPT" --mode quick --apply
        else
            echo "Cancelled."
        fi
        ;;
    preview-full)
        python3 "$PYTHON_SCRIPT" --mode full --dry-run
        ;;
    apply-full)
        echo "⚠️  This will modify 250+ files AND convert component patterns. Continue? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            python3 "$PYTHON_SCRIPT" --mode full --apply
        else
            echo "Cancelled."
        fi
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run without arguments to see usage."
        exit 1
        ;;
esac
