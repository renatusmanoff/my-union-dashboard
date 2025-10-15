'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function DocumentsPage() {
  return (
    <DashboardLayout userRole="SUPER_ADMIN">
      <div className="p-6" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Электронный документооборот</h1>
              <p className="text-gray-400">Управление документами и их версиями</p>
            </div>
          </div>

          {/* Content */}
          <div className="card p-6 rounded-lg">
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Документооборот</h3>
              <p className="text-gray-400 mb-4">Функционал будет добавлен в следующих версиях</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
