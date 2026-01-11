import os

base_path = "nextjs/src/app"
routes = [
    "docket", "workflows", "messages", "discovery", "evidence",
    "exhibits", "correspondence", "jurisdiction", "analytics", "calendar",
    "billing", "practice", "crm", "documents", "drafting",
    "library", "clauses", "research", "citations", "compliance",
    "admin", "war_room", "rules_engine", "entities", "data_platform",
    "profile", "daf", "pleading_builder", "litigation_builder", "real_estate"
]

template = """export default function {}Page() {{
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{}</h1>
      <p className="text-slate-600 dark:text-slate-400">Section under construction</p>
    </div>
  );
}}
"""

for route in routes:
    dir_path = os.path.join(base_path, route)
    os.makedirs(dir_path, exist_ok=True)
    file_path = os.path.join(dir_path, "page.tsx")

    # Simple Title formatting
    title = route.replace("_", " ").title()
    component_name = route.replace("_", "").title()

    with open(file_path, "w") as f:
        f.write(template.format(component_name, title))

print("Routes created.")
