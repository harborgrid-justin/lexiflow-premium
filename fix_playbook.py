
path = '/workspaces/lexiflow-premium/frontend/src/api/types/playbook.ts'
with open(path, 'r') as f:
    content = f.read()

old_config = """    warRoomConfig: {
      enabled: false,
      dedicatedSpace: false,
      teamSize: 0,
      requiredRoles: [],
    },"""

new_config = """    warRoomConfig: {
      recommendedTabs: [],
      evidenceTags: [],
    },"""

# Replace all occurrences
new_content = content.replace(old_config, new_config)

with open(path, 'w') as f:
    f.write(new_content)
print("Updated playbook.ts")
