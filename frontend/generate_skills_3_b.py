import os

base_dir = "/workspaces/lexiflow-premium/frontend/.github-skills"

skills_batch_b = [
    {
        "name": "state-machine-driven-ui",
        "title": "State Machine Driven UI",
        "summary": "Model complex UI flows using finite state machines to ensure deterministic behavior.",
        "capabilities": [
            "Define strict states.",
            "Visualize application logic.",
            "Prevent impossible states."
        ],
        "challenges": [
            "Handle parallel states.",
            "Synchronize state machine context.",
            "Scale statecharts."
        ],
        "acceptance": [
            "Refactor a complex flow.",
            "Provide a visualization.",
            "Demonstrate robustness."
        ]
    },
    {
        "name": "video-frame-processing-react",
        "title": "Video Frame Processing in React",
        "summary": "Process video data in real-time within a React application, synchronizing UI overlays.",
        "capabilities": [
            "Extract video frames.",
            "Sync overlay elements.",
            "Implement playback controls."
        ],
        "challenges": [
            "Maintain 60fps rendering.",
            "Handle video buffering.",
            "Manage memory bandwidth."
        ],
        "acceptance": [
            "Build a video player.",
            "Demonstrate smooth playback.",
            "Provide performance metrics."
        ]
    },
    {
        "name": "audio-visualization-scheduling",
        "title": "Audio Visualization and Scheduling",
        "summary": "Visualize audio frequency/time-domain data synchronized with React updates.",
        "capabilities": [
            "Connect WebAudio AnalyzerNodes.",
            "Decouple audio processing.",
            "Visualize high-frequency data."
        ],
        "challenges": [
            "Smooth distinct FFT data.",
            "Handle audio latency.",
            "Optimize drawing performance."
        ],
        "acceptance": [
            "Create a real-time visualizer.",
            "Demonstrate sync.",
            "Document the scheduling."
        ]
    },
    {
        "name": "service-worker-caching-strategies",
        "title": "Service Worker Caching Strategies",
        "summary": "Implement robust offline caching and asset management for React apps via Service Workers.",
        "capabilities": [
            "Cache app shell and assets.",
            "Implement runtime caching.",
            "Handle service worker updates."
        ],
        "challenges": [
            "Prevent cache poisoning.",
            "Debug scoping issues.",
            "Manage quota interaction."
        ],
        "acceptance": [
            "Demonstrate offline launch.",
            "Show update prompt.",
            "Provide a cache strategy."
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

generate_skills(skills_batch_b)
