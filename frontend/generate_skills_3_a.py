import os

base_dir = "/workspaces/lexiflow-premium/frontend/.github-skills"

skills_batch_a = [
    {
        "name": "client-side-cache-normalization",
        "title": "Client-Side Cache Normalization",
        "summary": "Implement a normalized entity cache to maintain data consistency across a React app.",
        "capabilities": [
            "Flatten nested API responses.",
            "Automatic UI updates.",
            "Garbage collect entities."
        ],
        "challenges": [
            "Handle polymorphic data types.",
            "Resolve relationships.",
            "Optimize read performance."
        ],
        "acceptance": [
            "Demonstrate consistency.",
            "Provide a schema.",
            "Benchmark retrieval speeds."
        ]
    },
    {
        "name": "query-deduplication-engines",
        "title": "Query Deduplication Engines",
        "summary": "Build mechanisms to debounce and deduplicate redundant data fetching requests.",
        "capabilities": [
            "Identify identical requests.",
            "Share promises.",
            "Time-window coalescing."
        ],
        "challenges": [
            "Handle race conditions.",
            "Correctly scope sharing.",
            "Debug timing issues."
        ],
        "acceptance": [
            "Show reduction in requests.",
            "Demonstrate data distribution.",
            "Provide tests."
        ]
    },
    {
        "name": "visual-regression-snapshot-testing",
        "title": "Visual Regression and Snapshot Testing",
        "summary": "Automate visual validation of component states to catch styling regressions.",
        "capabilities": [
            "Capture component snapshots.",
            "Diff images.",
            "Integrate into CI/CD."
        ],
        "challenges": [
            "Handle non-deterministic rendering.",
            "Manage storage.",
            "Reduce flake."
        ],
        "acceptance": [
            "Implement visual suite.",
            "Demonstrate detection.",
            "Document workflow."
        ]
    },
    {
        "name": "dependency-injection-patterns",
        "title": "Dependency Injection Patterns in React",
        "summary": "Decouple business logic from UI using Inversion of Control with Context and Hooks.",
        "capabilities": [
            "Inject service implementations.",
            "Mock dependencies.",
            "Manage service lifecycles."
        ],
        "challenges": [
            "Prevent Context hell.",
            "Ensure type safety.",
            "Avoid re-renders."
        ],
        "acceptance": [
            "Provide DI container.",
            "Demonstrate hot-swapping.",
            "Show improved testability."
        ]
    }
]

def generate_skills(skills):
    for skill in skills:
        folder_path = os.path.join(base_dir, skill['name'])
        os.makedirs(folder_path, exist_ok=True)

        file_path = os.path.join(folder_path, "SKILL.md")

        content = f"""---
name: {skill['name']}
description: {skill['summary']}
---

# {skill['title']}

## Summary
{skill['summary']}

## Key Capabilities
"""
        for cap in skill['capabilities']:
            content += f"- {cap}\n"

        content += "\n## PhD-Level Challenges\n"
        for chal in skill['challenges']:
            content += f"- {chal}\n"

        content += "\n## Acceptance Criteria\n"
        for acc in skill['acceptance']:
            content += f"- {acc}\n"

        with open(file_path, 'w') as f:
            f.write(content)

        print(f"Created {file_path}")

generate_skills(skills_batch_a)
