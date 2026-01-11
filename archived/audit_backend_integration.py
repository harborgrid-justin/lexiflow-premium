import os
import re

repo_dir = "nextjs/src/services/data/repositories"
files = [f for f in os.listdir(repo_dir) if f.endswith(".ts") and f != "RepositoryRegistry.ts"]

print(f"{'Repository':<30} | {'Backend Check':<15} | {'Api Service':<15}")
print("-" * 65)

for f in files:
    path = os.path.join(repo_dir, f)
    with open(path, "r") as file:
        content = file.read()

    has_backend_check = "isBackendApiEnabled" in content
    has_api_service = "ApiService" in content or "Api " in content or "Api;" in content # loose check for Api usage

    # We want to flag those that are NOT using backend check
    check_status = "✅ YES" if has_backend_check else "❌ NO"
    service_status = "✅ YES" if has_api_service else "❌ NO"

    print(f"{f:<30} | {check_status:<15} | {service_status:<15}")
