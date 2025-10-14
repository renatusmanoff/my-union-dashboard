import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  return (
    <DashboardLayout userRole="ADMIN">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div 
          className="rounded-xl shadow-soft p-6"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Добро пожаловать в MyUnion Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Панель управления для профсоюзных организаций
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            className="rounded-xl shadow-soft p-6"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Новости
                </p>
                <p 
                  className="text-2xl font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  24
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-soft p-6"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Задачи
                </p>
                <p 
                  className="text-2xl font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  12
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-soft p-6"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Организации
                </p>
                <p 
                  className="text-2xl font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  8
                </p>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-soft p-6"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Члены профсоюза
                </p>
                <p 
                  className="text-2xl font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  1,234
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            className="rounded-xl shadow-soft p-6"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Последние новости
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Заседание центрального комитета
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    2 часа назад
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Новые льготы для членов профсоюза
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    5 часов назад
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Обновление регламента работы
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    1 день назад
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="rounded-xl shadow-soft p-6"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Активные задачи
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Подготовить отчет за месяц
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Срок: 15 декабря
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                  В работе
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Провести собрание коллектива
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Срок: 20 декабря
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  Планируется
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Обновить базу данных членов
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Срок: 25 декабря
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                  Срочно
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Быстрые действия
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Добавить новость</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Создать задачу</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Добавить члена</span>
            </button>
            
            <button className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Создать отчет</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
