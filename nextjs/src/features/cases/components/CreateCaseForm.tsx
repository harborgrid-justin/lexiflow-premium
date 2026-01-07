"use client";

import { useActionState } from "react"; // React 19 hook for Actions
import { createCaseAction } from "@/actions/case-actions";

// Initial state for the action
const initialState = {
  success: false,
  message: "",
};

export function CreateCaseForm() {
  const [state, formAction, isPending] = useActionState(createCaseAction, initialState);

  return (
    <form action={formAction} className="space-y-6 max-w-lg mx-auto bg-white p-8 rounded shadow">
      {state.message && (
        <div className={`p-4 rounded ${state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Case Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
          placeholder="e.g. Smith v. Jones"
        />
      </div>

      <div>
        <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700">
          Case Number
        </label>
        <input
          type="text"
          id="caseNumber"
          name="caseNumber"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
          placeholder="e.g. 2024-CV-12345"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-black"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Case"}
        </button>
      </div>
    </form>
  );
}
