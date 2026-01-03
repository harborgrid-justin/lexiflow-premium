#!/bin/bash

# Fix unused useId in integrations.tsx
sed -i "s/import { useId, useState }/import { useState }/" src/routes/admin/integrations.tsx

# Fix unused rateTables in billing/rates.tsx  
sed -i "s/const \[rateTables, setRateTables\]/const [_rateTables, setRateTables]/" src/routes/billing/rates.tsx

# Fix unused totalCount in documents/index.tsx
sed -i "s/const \[documents, totalCount, isLoading\]/const [documents, _totalCount, isLoading]/" src/routes/documents/index.tsx

# Fix unused reason parameter in billing-features.ts
sed -i "s/export function canPerformAction(action: BillingAction, reason: string): boolean {/export function canPerformAction(action: BillingAction, _reason: string): boolean {/" src/utils/billing-features.ts

echo "✓ Fixed unused variables in admin routes and utils"
