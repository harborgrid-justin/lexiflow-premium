/**
 * Knowledge Base Page - Server Component with Data Fetching
 * Legal knowledge and article repository
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Knowledge Base | LexiFlow',
  description: 'Legal knowledge and article repository',
};

export default async function KnowledgeBasePage(): Promise<React.JSX.Element> {
  // Fetch knowledge articles
  let articles = [];

  try {
    articles = await apiFetch(API_ENDPOINTS.KNOWLEDGE.ARTICLES);
  } catch (error) {
    console.error('Failed to load knowledge base:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Knowledge Base</h1>
      <Suspense fallback={<div>Loading articles...</div>}>
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {articles.map((article: any) => (
              <div key={article.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                <h3 className="font-semibold">{article.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {article.summary}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">No articles available</p>
        )}
      </Suspense>
    </div>
  );
}
