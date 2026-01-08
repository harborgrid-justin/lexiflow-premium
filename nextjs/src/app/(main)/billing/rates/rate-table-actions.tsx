'use client';

/**
 * Rate Table Actions Component
 *
 * Client-side actions for rate table operations.
 */

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, MoreVertical, Loader2, Check, X } from 'lucide-react';
import { rateTableFormAction } from '../actions';
import type { RateTable, ActionResult } from '../types';
import { useState, useEffect } from 'react';

interface RateTableActionsProps {
  rateTable: RateTable;
}

export function RateTableActions({ rateTable }: RateTableActionsProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [state, formAction, isPending] = useActionState(
    rateTableFormAction,
    { success: false } as ActionResult
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
      setShowMenu(false);
    }
  }, [state.success, router]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {/* Edit Rate Table */}
            <button
              onClick={() => {
                router.push(`/billing/rates/${rateTable.id}/edit`);
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Edit className="h-4 w-4 text-blue-500" />
              Edit
            </button>

            {/* Activate/Deactivate */}
            {rateTable.status === 'Draft' && (
              <form action={formAction}>
                <input type="hidden" name="intent" value="activate" />
                <input type="hidden" name="id" value={rateTable.id} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-emerald-500" />
                  )}
                  Activate
                </button>
              </form>
            )}

            {rateTable.status === 'Active' && (
              <form action={formAction}>
                <input type="hidden" name="intent" value="deactivate" />
                <input type="hidden" name="id" value={rateTable.id} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 text-amber-500" />
                  )}
                  Deactivate
                </button>
              </form>
            )}

            {/* Delete (only for Draft) */}
            {rateTable.status === 'Draft' && (
              <form action={formAction}>
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={rateTable.id} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </form>
            )}

            {rateTable.status === 'Inactive' && (
              <p className="px-4 py-2 text-sm text-slate-400">
                No actions available
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
