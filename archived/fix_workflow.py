
import os

api_path = '/workspaces/lexiflow-premium/frontend/src/api/workflow/workflow-api.ts'

with open(api_path, 'r') as f:
    lines = f.readlines()

# find insert point (after syncEngine)
insert_idx = 0
for i, line in enumerate(lines):
    if 'async syncEngine(): Promise' in line:
        # find end of method
        for j in range(i, len(lines)):
            if lines[j].strip() == '}':
                insert_idx = j + 2 # Leave a blank line
                break
        break

run_automation_code = [
    "  /**\n",
    "   * Trigger workflow automation engine\n",
    "   * @param scope - Scope of automation (e.g., 'all', 'case')\n",
    "   */\n",
    "  async runAutomation(\n",
    "    scope?: string\n",
    "  ): Promise<{ success: boolean; processed: number; actions: number }> {\n",
    "    try {\n",
    "      // In a real implementation, this would trigger a backend job.\n",
    "      // For now, we simulate success to trigger the frontend refetch (which is the actual 'sync' effect).\n",
    "      console.log(\n",
    "        `[WorkflowApiService] Running automation${scope ? ` for scope: ${scope}` : \"\"}`\n",
    "      );\n",
    "      await new Promise((resolve) => setTimeout(resolve, 500));\n",
    "      return { success: true, processed: 0, actions: 0 };\n",
    "    } catch (error) {\n",
    "      console.error(\"[WorkflowApiService.runAutomation] Error:\", error);\n",
    "      throw error;\n",
    "    }\n",
    "  }\n",
    "\n"
]

lines[insert_idx:insert_idx] = run_automation_code

# Find cutoff point (line 865 approx, check for header)
cutoff_idx = -1
for i, line in enumerate(lines):
    if '// WORKFLOW INSTANCE OPERATIONS' in line and i > 800: # Ensure it's the second occurrence
        cutoff_idx = i
        break

if cutoff_idx != -1:
    # We found the duplicate block
    print(f"Cutting off duplicate block at line {cutoff_idx + 1}")
    # Delete from cutoff to end
    del lines[cutoff_idx:]
    # Append closing brace
    lines.append("}\n")
else:
    print("Duplicate block not found")

with open(api_path, 'w') as f:
    f.writelines(lines)

print("Fixed workflow-api.ts")
