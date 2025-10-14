'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { UserRole } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
}

export default function DashboardLayout({ children, userRole = 'SUPER_ADMIN' }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <Sidebar 
        userRole={userRole}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header 
          className="shadow-sm border-b"
          style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderColor: 'var(--card-border)' 
          }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <h2 
                className="text-xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Dashboard
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск..."
                  className="w-64 px-4 py-2 pl-10 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>


              {/* Notifications */}
              <button 
                className="relative p-2 transition-colors hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.066 32.94 32.94 0 003.256.508 3.5 3.5 0 006.972 0 32.933 32.933 0 003.256-.508.75.75 0 00.515-1.066A11.719 11.719 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9.307 33.54 33.54 0 003.9-.307 2 2 0 01-3.9 0z" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:opacity-70"
                  style={{ backgroundColor: 'var(--card-bg)' }}
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">ИИ</span>
                  </div>
                  <div className="text-left">
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Иван Иванов
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Администратор
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
