'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function KnowledgePage() {
  return (
    <DashboardLayout userRole="SUPER_ADMIN">
      <div className="p-6" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">База знаний</h1>
              <p className="text-gray-400">Централизованное хранилище информации</p>
            </div>
          </div>

          {/* Content */}
          <div className="card p-6 rounded-lg">
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">База знаний</h3>
              <p className="text-gray-400 mb-4">Функционал будет добавлен в следующих версиях</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
