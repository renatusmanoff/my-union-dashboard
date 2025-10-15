'use client';

import DashboardLayout from '@/components/DashboardLayout';

export default function ProjectsPage() {
  return (
    <DashboardLayout userRole="SUPER_ADMIN">
      <div className="p-6" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Проекты</h1>
              <p className="text-gray-400">Управление проектами и задачами</p>
            </div>
          </div>

          {/* Content */}
          <div className="card p-6 rounded-lg">
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Проекты</h3>
              <p className="text-gray-400 mb-4">Функционал будет добавлен в следующих версиях</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
