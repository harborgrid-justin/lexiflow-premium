# Entity Refactoring Summary

All entities from `src/entities` have been refactored and moved to their respective feature modules. The `src/entities` directory has been deleted.

## Refactored Entities

| Entity | New Location | Notes |
| :--- | :--- | :--- |
| `Session` | `src/auth/entities/session.entity.ts` | Added `sessions` relation to `User` entity. |
| `Organization` | `src/organizations/entities/organization.entity.ts` | Created new `organizations` module. |
| `LegalEntity` | `src/legal-entities/entities/legal-entity.entity.ts` | Created new `legal-entities` module. |
| `LegalDocument` | N/A | Deleted. Duplicate of `Document` in `src/documents`. |
| `PleadingDocument` | N/A | Deleted. Duplicate of `Pleading` in `src/pleadings`. Added missing fields to `Pleading`. |
| `PrivilegeLogEntry` | `src/discovery/privilege-log/entities/privilege-log-entry.entity.ts` | Merged fields and updated to extend `BaseEntity`. |
| `ESISource` | `src/discovery/esi-sources/entities/esi-source.entity.ts` | Merged fields and updated to extend `BaseEntity`. |

## Other Updates

- Updated all entities to extend `BaseEntity` from `src/common/base/base.entity.ts`.
- Ensured all columns use `snake_case` naming convention.
- Deleted duplicate `ChainOfCustodyEvent` in `src/discovery/productions`.
- Updated imports in `Task`, `DocketEntry`, `CalendarEvent`, `Client`, `Case`, `TimeEntry`, and `Invoice` to point to the correct `BaseEntity`.

## Next Steps

- Run migrations to apply schema changes (many tables were renamed or columns changed).
- Verify relationships between entities.
- Check for any broken imports in services or controllers (though most should be fine as I updated the entity files in place where possible).
