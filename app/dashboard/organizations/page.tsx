import DashboardLayout from '@/components/DashboardLayout';
import { Organization } from '@/types';

// Моковые данные для организаций
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Центральный комитет профсоюза',
    type: 'FEDERAL',
    address: 'г. Москва, ул. Тверская, д. 1',
    phone: '+7 (495) 123-45-67',
    email: 'info@union.ru',
    chairmanName: 'Иван Петров',
    isActive: true,
    membersCount: 15000,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Региональная организация Москвы',
    type: 'REGIONAL',
    parentId: '1',
    address: 'г. Москва, ул. Арбат, д. 10',
    phone: '+7 (495) 234-56-78',
    email: 'moscow@union.ru',
    chairmanName: 'Мария Сидорова',
    isActive: true,
    membersCount: 5000,
    createdAt: new Date('2020-02-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Местная организация Центрального округа',
    type: 'LOCAL',
    parentId: '2',
    address: 'г. Москва, ул. Красная площадь, д. 1',
    phone: '+7 (495) 345-67-89',
    email: 'central@union.ru',
    chairmanName: 'Алексей Козлов',
    isActive: true,
    membersCount: 1000,
    createdAt: new Date('2020-03-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Первичная организация завода "Москва"',
    type: 'PRIMARY',
    parentId: '3',
    address: 'г. Москва, ул. Заводская, д. 5',
    phone: '+7 (495) 456-78-90',
    email: 'factory@union.ru',
    chairmanName: 'Елена Волкова',
    isActive: true,
    membersCount: 500,
    createdAt: new Date('2020-04-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const typeLabels = {
  FEDERAL: 'Федеральный',
  REGIONAL: 'Региональная',
  LOCAL: 'Местная',
  PRIMARY: 'Первичная'
};

const typeColors = {
  FEDERAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  REGIONAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  LOCAL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  PRIMARY: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

export default function OrganizationsPage() {
  return (
    <DashboardLayout userRole="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Организации
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Управление профсоюзными организациями
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Экспорт
            </button>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Создать организацию
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Поиск по организациям..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Все типы</option>
              <option value="CENTRAL_COMMITTEE">Центральный комитет</option>
              <option value="REGIONAL">Региональная</option>
              <option value="LOCAL">Местная</option>
              <option value="PRIMARY">Первичная</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Все регионы</option>
              <option value="moscow">Москва</option>
              <option value="spb">Санкт-Петербург</option>
              <option value="other">Другие</option>
            </select>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Организация
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Руководитель
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Члены
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Контакты
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {mockOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {org.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {org.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[org.type]}`}>
                        {typeLabels[org.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {org.chairmanName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {org.membersCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>{org.phone}</div>
                        <div className="text-gray-500 dark:text-gray-400">{org.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="text-red-400 hover:text-red-600 dark:hover:text-red-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Показано 1-4 из 4 организаций
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Предыдущая
            </button>
            <button className="px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700">
              1
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Следующая
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
