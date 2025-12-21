# Quick Migration Guide: Mock Data → Backend API

Use this guide to migrate any component from mock data to backend API pattern.

---

## Step-by-Step Process

### 1. Identify Mock Data
Look for `useState` with array initialization:
```typescript
// ❌ OLD PATTERN - Mock data
const [items, setItems] = useState<Item[]>(mockItems);
```

### 2. Replace with useQuery
```typescript
// ✅ NEW PATTERN - Backend API
import { useQuery } from 'react-query';
import { queryKeys } from '../../../utils/queryKeys';

const { data: items = [], refetch, isLoading, error } = useQuery(
  queryKeys.domain.all(),  // Use appropriate query key
  async () => {
    // TODO: Call backend API when ready
    // return await DataService.domain.getAll();
    return [];  // Empty default until backend is ready
  }
);
```

### 3. Update Create Handler
```typescript
// ❌ OLD - Local state mutation
const handleCreate = () => {
  const newItem = { id: Date.now(), ...formData };
  setItems([...items, newItem]);
  notify.success('Created');
};

// ✅ NEW - Async with backend call + refetch
const handleCreate = async () => {
  if (!formData.name) {
    notify.error('Name is required');
    return;
  }
  
  try {
    // TODO: Call backend API when ready
    // const newItem = await DataService.domain.create(formData);
    await refetch();  // Refresh data from backend
    setFormData({});  // Reset form
    createModal.close();  // Close modal
    notify.success('Created successfully');
  } catch (error) {
    console.error('Create failed:', error);
    notify.error('Failed to create item');
  }
};
```

### 4. Update Edit Handler
```typescript
// ❌ OLD - Local state mutation
const handleEdit = () => {
  setItems(items.map(item => 
    item.id === selectedItem.id ? { ...item, ...formData } : item
  ));
  notify.success('Updated');
};

// ✅ NEW - Async with backend call + refetch
const handleEdit = async () => {
  if (!selectedItem) return;
  
  try {
    // TODO: Call backend API when ready
    // await DataService.domain.update(selectedItem.id, formData);
    await refetch();  // Refresh data from backend
    setSelectedItem(null);  // Clear selection
    editModal.close();  // Close modal
    notify.success('Updated successfully');
  } catch (error) {
    console.error('Update failed:', error);
    notify.error('Failed to update item');
  }
};
```

### 5. Update Delete Handler
```typescript
// ❌ OLD - Local state mutation
const handleDelete = () => {
  setItems(items.filter(item => item.id !== selectedItem.id));
  notify.success('Deleted');
};

// ✅ NEW - Async with backend call + refetch
const handleDelete = async () => {
  if (!selectedItem) return;
  
  try {
    // TODO: Call backend API when ready
    // await DataService.domain.delete(selectedItem.id);
    await refetch();  // Refresh data from backend
    setSelectedItem(null);  // Clear selection
    deleteModal.close();  // Close modal
    notify.success('Deleted successfully');
  } catch (error) {
    console.error('Delete failed:', error);
    notify.error('Failed to delete item');
  }
};
```

---

## Required Imports

Add these imports to your component:

```typescript
import { useQuery } from 'react-query';
import { queryKeys } from '../../../utils/queryKeys';
import { useNotify } from '../../../hooks/useNotify';
import { useModalState } from '../../../hooks/useModalState';
import { DataService } from '../../../services/dataService';  // For later backend integration
```

---

## Hook Usage

### 1. useQuery Hook
```typescript
const { 
  data = [],           // Data array (defaults to empty)
  refetch,             // Function to refetch data
  isLoading,           // Loading state
  error,               // Error object if query fails
  isFetching           // True during background refetch
} = useQuery(
  queryKeys.domain.all(),     // Cache key
  async () => {               // Fetcher function
    return await DataService.domain.getAll();
  },
  {
    staleTime: 5000,          // Optional: Data fresh for 5 seconds
    refetchOnWindowFocus: true // Optional: Refetch on window focus
  }
);
```

### 2. useModalState Hook
```typescript
const createModal = useModalState();
const editModal = useModalState();
const deleteModal = useModalState();

// Usage:
<button onClick={createModal.open}>Create</button>

<Modal isOpen={createModal.isOpen} onClose={createModal.close}>
  {/* Modal content */}
</Modal>
```

### 3. useNotify Hook
```typescript
const notify = useNotify();

// Usage:
notify.success('Operation successful');
notify.error('Operation failed');
notify.info('Information message');
notify.warning('Warning message');
```

---

## Loading & Error States

Add loading and error UI:

```typescript
// At the top of your render
if (isLoading) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader className="h-8 w-8 animate-spin" />
      <span className="ml-2">Loading...</span>
    </div>
  );
}

if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-800">Error loading data: {error.message}</p>
      <button 
        onClick={() => refetch()} 
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );
}
```

---

## Complete Example

Here's a full component migration:

### Before (Mock Data)
```typescript
import React, { useState } from 'react';

const MyComponent = () => {
  const [items, setItems] = useState<Item[]>(mockItems);
  const [formData, setFormData] = useState({ name: '' });
  
  const handleCreate = () => {
    setItems([...items, { id: Date.now(), ...formData }]);
  };
  
  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          {item.name}
          <button onClick={() => handleDelete(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

### After (Backend API)
```typescript
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { queryKeys } from '../../../utils/queryKeys';
import { useNotify } from '../../../hooks/useNotify';
import { useModalState } from '../../../hooks/useModalState';
import { Loader } from 'lucide-react';

const MyComponent = () => {
  // Query for data
  const { data: items = [], refetch, isLoading, error } = useQuery(
    queryKeys.domain.all(),
    async () => {
      // TODO: Call backend when ready
      // return await DataService.domain.getAll();
      return [];
    }
  );
  
  // Form state
  const [formData, setFormData] = useState({ name: '' });
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Modals
  const createModal = useModalState();
  const deleteModal = useModalState();
  
  // Notifications
  const notify = useNotify();
  
  // Handlers
  const handleCreate = async () => {
    if (!formData.name) {
      notify.error('Name is required');
      return;
    }
    
    try {
      // TODO: Call backend
      // await DataService.domain.create(formData);
      await refetch();
      setFormData({ name: '' });
      createModal.close();
      notify.success('Created successfully');
    } catch (error) {
      notify.error('Failed to create');
    }
  };
  
  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      // TODO: Call backend
      // await DataService.domain.delete(selectedItem.id);
      await refetch();
      setSelectedItem(null);
      deleteModal.close();
      notify.success('Deleted successfully');
    } catch (error) {
      notify.error('Failed to delete');
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }
  
  // Render
  return (
    <div>
      <button onClick={createModal.open}>Create</button>
      
      {items.map(item => (
        <div key={item.id}>
          {item.name}
          <button 
            onClick={() => {
              setSelectedItem(item);
              deleteModal.open();
            }}
          >
            Delete
          </button>
        </div>
      ))}
      
      {/* Create Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close}>
        <input
          value={formData.name}
          onChange={e => setFormData({ name: e.target.value })}
        />
        <button onClick={handleCreate}>Save</button>
      </Modal>
      
      {/* Delete Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close}>
        <p>Are you sure you want to delete {selectedItem?.name}?</p>
        <button onClick={handleDelete}>Delete</button>
      </Modal>
    </div>
  );
};

export default MyComponent;
```

---

## Query Key Reference

Use these from `utils/queryKeys.ts`:

```typescript
queryKeys.cases.all()
queryKeys.cases.detail(id)
queryKeys.cases.byCaseId(caseId)

queryKeys.documents.all()
queryKeys.documents.detail(id)

queryKeys.users.all()
queryKeys.users.detail(id)

queryKeys.timeEntries.all()
queryKeys.timeEntries.byCaseId(caseId)

queryKeys.invoices.all()
queryKeys.invoices.byStatus(status)

queryKeys.billing.invoices()
queryKeys.billing.timeEntries()
queryKeys.billing.feeAgreements()

queryKeys.admin.users()
queryKeys.admin.apiKeys()
queryKeys.admin.settings()

// See queryKeys.ts for full list
```

---

## Common Pitfalls

### ❌ Forgetting to await refetch
```typescript
const handleCreate = async () => {
  // await DataService.domain.create(data);
  refetch();  // ❌ Not awaited - UI may update before refetch completes
};
```

### ✅ Always await refetch
```typescript
const handleCreate = async () => {
  // await DataService.domain.create(data);
  await refetch();  // ✅ UI updates after refetch
};
```

### ❌ Missing try/catch
```typescript
const handleCreate = async () => {
  await DataService.domain.create(data);  // ❌ No error handling
  await refetch();
};
```

### ✅ Always use try/catch
```typescript
const handleCreate = async () => {
  try {
    await DataService.domain.create(data);
    await refetch();
    notify.success('Created');
  } catch (error) {
    notify.error('Failed');
  }
};
```

### ❌ Not checking for null/undefined
```typescript
const handleDelete = async () => {
  await DataService.domain.delete(selectedItem.id);  // ❌ selectedItem might be null
};
```

### ✅ Always check for null
```typescript
const handleDelete = async () => {
  if (!selectedItem) return;  // ✅ Guard clause
  await DataService.domain.delete(selectedItem.id);
};
```

---

## Testing Your Migration

1. **Check Loading State**: Verify spinner shows while loading
2. **Check Empty State**: Verify UI with empty data array `[]`
3. **Check Error State**: Simulate error and verify error UI
4. **Check Create**: Verify refetch called and UI updates
5. **Check Edit**: Verify refetch called and UI updates
6. **Check Delete**: Verify refetch called and item removed
7. **Check Notifications**: Verify success/error toasts appear

---

## Checklist

When migrating a component, check off:

- [ ] Removed `useState` with mock data
- [ ] Added `useQuery` with query key
- [ ] Added `useNotify` hook
- [ ] Added `useModalState` for modals
- [ ] Made all handlers `async`
- [ ] Added `try/catch` to all mutations
- [ ] Added `await refetch()` after mutations
- [ ] Added loading state UI
- [ ] Added error state UI
- [ ] Added null checks for selected items
- [ ] Added form validation
- [ ] Added TODO comments for backend calls
- [ ] Tested all CRUD operations
- [ ] Verified notifications appear

---

## Need Help?

Refer to these already-migrated components as examples:
- `frontend/components/admin/api-keys/ApiKeyManagement.tsx`
- `frontend/components/admin/users/UserManagement.tsx`
- `frontend/components/billing/fee-agreements/FeeAgreementManagement.tsx`

---

**Quick Reference Card** - Print this!

```typescript
// 1. Query
const { data = [], refetch, isLoading, error } = useQuery(
  queryKeys.domain.all(),
  async () => []  // TODO: backend call
);

// 2. Hooks
const notify = useNotify();
const modal = useModalState();

// 3. Handler Template
const handleAction = async () => {
  try {
    // TODO: await DataService.domain.action(data);
    await refetch();
    modal.close();
    notify.success('Success');
  } catch (error) {
    notify.error('Failed');
  }
};
```
