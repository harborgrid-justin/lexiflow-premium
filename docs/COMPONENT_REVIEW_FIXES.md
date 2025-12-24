# Component Review - Required Fixes

## Critical Issues to Fix

### 1. CaseStrategy.tsx - Missing Data Persistence

**File**: `frontend/components/case-detail/CaseStrategy.tsx`

**Problem**: Citations, arguments, and defenses are only stored in local state - not persisted to DataService.

**Fix Required**:
```tsx
// Add at top of component
import { useQuery, useMutation, queryClient } from '@/services/queryClient';
import { DataService } from '@/services/dataService';
import { STORES } from '@/services/db';

// Replace useState with useQuery
const { data: citations = [], isLoading: citationsLoading } = useQuery(
  [STORES.CITATIONS, caseId],
  () => DataService.cases.getCitations(caseId) // Needs implementation in DataService
);

const { data: args = [], isLoading: argsLoading } = useQuery(
  [STORES.LEGAL_ARGUMENTS, caseId],
  () => DataService.cases.getArguments(caseId) // Needs implementation
);

const { data: defenses = [], isLoading: defensesLoading } = useQuery(
  [STORES.DEFENSES, caseId],
  () => DataService.cases.getDefenses(caseId) // Needs implementation
);

// Add mutations
const { mutate: addCitation } = useMutation(
  DataService.cases.addCitation,
  { invalidateKeys: [[STORES.CITATIONS, caseId]] }
);

const { mutate: addArgument } = useMutation(
  DataService.cases.addArgument,
  { invalidateKeys: [[STORES.LEGAL_ARGUMENTS, caseId]] }
);

const { mutate: addDefense } = useMutation(
  DataService.cases.addDefense,
  { invalidateKeys: [[STORES.DEFENSES, caseId]] }
);

// Update handleSave
const handleSave = () => {
  const id = IdGenerator.generate();
  if (modalType === 'Citation') {
    addCitation({ ...newItem, id, caseId, relevance: 'Medium' });
  } else if (modalType === 'Argument') {
    addArgument({ ...newItem, id, caseId, strength: 50, status: 'Draft' });
  } else {
    addDefense({ ...newItem, id, caseId, status: 'Asserted' });
  }
  setIsModalOpen(false);
  setNewItem({});
};
```

### 2. CaseListToolbar.tsx - Empty Button Handlers

**File**: `frontend/components/case-list/CaseListToolbar.tsx:99-100`

**Problem**: Sync and Export buttons do nothing

**Fix Required**:
```tsx
// Add props
interface CaseListToolbarProps {
  // ... existing props
  onSync?: () => void;
  onExport?: () => void;
}

// Update buttons
<Button 
  variant="ghost" 
  size="sm" 
  icon={RefreshCcw} 
  onClick={onSync || (() => console.warn('Sync handler not implemented'))} 
  className={theme.text.secondary}
>
  Sync
</Button>
<Button 
  variant="outline" 
  size="sm" 
  icon={Download} 
  onClick={onExport || (() => console.warn('Export handler not implemented'))}
>
  Export
</Button>
```

### 3. CaseListIntake.tsx - Replace alert() with Modal

**File**: `frontend/components/case-list/CaseListIntake.tsx:75`

**Problem**: Uses alert() instead of proper modal

**Fix Required**:
```tsx
// Add state
const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

// Replace alert with modal
const handleAddLead = () => {
  setIsLeadModalOpen(true);
};

// Add modal component at bottom
{isLeadModalOpen && (
  <CreateLeadModal 
    isOpen={isLeadModalOpen}
    onClose={() => setIsLeadModalOpen(false)}
    onSave={(lead) => {
      // Handle lead creation
      setIsLeadModalOpen(false);
    }}
  />
)}
```

### 4. CaseListIntake.tsx - Complete updateStage mutation

**File**: `frontend/components/case-list/CaseListIntake.tsx:41-52`

**Problem**: DataService call is commented out

**Fix Required**:
```tsx
const { mutate: updateStage } = useMutation(
  async ({ id, stage }: { id: string, stage: string }) => {
    return await DataService.crm.updateLead(id, { stage });
  },
  {
    invalidateKeys: [['crm', 'leads']],
    onSuccess: () => {
      // Optionally show success notification
    }
  }
);
```

### 5. AdvisoryBoard.tsx & OppositionManager.tsx - Filter Buttons

**Files**: 
- `frontend/components/war-room/AdvisoryBoard.tsx:108`
- `frontend/components/war-room/OppositionManager.tsx:108`

**Problem**: Filter buttons have empty handlers

**Fix Required**:
```tsx
// Add state
const [isFilterOpen, setIsFilterOpen] = useState(false);

// Update button
<Button 
  variant="secondary" 
  icon={Filter} 
  onClick={() => setIsFilterOpen(!isFilterOpen)} 
  className="hidden sm:flex"
>
  Filter
</Button>

// Add filter panel
{isFilterOpen && (
  <FilterPanel onClose={() => setIsFilterOpen(false)} />
)}
```

## Medium Priority Fixes

### 6. Replace console.log/alert placeholders

**Files with placeholders**:
- `frontend/components/pleading/PleadingBuilder.tsx:168` - Clause selection
- `frontend/components/pleading/editor/PleadingEditor.tsx:228` - Export
- `frontend/components/billing/BillingLedger.tsx:63` - Transaction logging
- `frontend/components/admin/data/PipelineMonitor.tsx:41` - Pipeline trigger

**Pattern to use**:
```tsx
// Instead of alert()
const { info } = useNotify();
onClick={() => info('Feature coming soon')}

// Or implement the actual functionality
onClick={() => handleActualImplementation()}
```

## DataService Extensions Needed

Add to `frontend/services/domains/CaseDomain.ts`:

```typescript
export class CaseRepository extends Repository<Case> {
  // ... existing methods
  
  async getCitations(caseId: string): Promise<Citation[]> {
    return this.getByIndex('caseId', caseId);
  }
  
  async addCitation(citation: Citation): Promise<Citation> {
    return this.add(citation);
  }
  
  async getArguments(caseId: string): Promise<LegalArgument[]> {
    return this.getByIndex('caseId', caseId);
  }
  
  async addArgument(argument: LegalArgument): Promise<LegalArgument> {
    return this.add(argument);
  }
  
  async getDefenses(caseId: string): Promise<Defense[]> {
    return this.getByIndex('caseId', caseId);
  }
  
  async addDefense(defense: Defense): Promise<Defense> {
    return this.add(defense);
  }
}
```

## Testing Checklist

After implementing fixes:

- [ ] CaseStrategy loads and persists citations/arguments/defenses
- [ ] Sync button triggers actual sync operation
- [ ] Export button generates and downloads export file
- [ ] Lead intake opens modal instead of alert
- [ ] Filter buttons open filter panels
- [ ] All mutations properly invalidate cache
- [ ] Error states handled gracefully
- [ ] Loading states displayed correctly

## Notes

- No circular dependencies detected ✅
- Most components follow DataService pattern correctly ✅
- Theme system properly implemented across all components ✅
- Keyboard shortcuts implemented where appropriate ✅
- Error boundaries in place for critical sections ✅
