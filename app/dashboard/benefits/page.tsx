'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Discount } from '@/types';

// Моковые данные для льгот и скидок
const mockBenefits: Discount[] = [
  {
    id: '1',
    title: 'Скидка 15% на медицинские услуги',
    description: 'Скидка на все медицинские услуги в центре "Здоровье" для членов профсоюза',
    discountPercent: 15,
    category: 'Здравоохранение',
    partnerId: '1',
    partnerName: 'ООО "Медицинский центр Здоровье"',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Абонемент в фитнес-клуб со скидкой 20%',
    description: 'Специальная цена на абонементы в сети фитнес-клубов "СпортЛайф"',
    discountPercent: 20,
    category: 'Спорт и фитнес',
    partnerId: '2',
    partnerName: 'Сеть фитнес-клубов "СпортЛайф"',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    title: 'Туристические путевки со скидкой 10%',
    description: 'Скидка на все туристические пакеты и путевки от агентства "Путешествия+"',
    discountPercent: 10,
    category: 'Туризм',
    partnerId: '3',
    partnerName: 'Туристическое агентство "Путешествия+"',
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-06-30'),
    isActive: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
];

const categoryColors = {
  'Здравоохранение': 'bg-green-500 text-white',
  'Спорт и фитнес': 'bg-blue-500 text-white',
  'Туризм': 'bg-purple-500 text-white',
  'Образование': 'bg-yellow-500 text-white',
  'Торговля': 'bg-orange-500 text-white'
};

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Discount[]>(mockBenefits);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredBenefits = benefits.filter(benefit => {
    const matchesSearch = benefit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         benefit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || benefit.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Льготы и скидки
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Каталог льгот и скидок для членов профсоюза
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Поиск по льготам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Все категории</option>
              <option value="Здравоохранение">Здравоохранение</option>
              <option value="Спорт и фитнес">Спорт и фитнес</option>
              <option value="Туризм">Туризм</option>
              <option value="Образование">Образование</option>
              <option value="Торговля">Торговля</option>
            </select>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBenefits.map((benefit) => (
            <div key={benefit.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden hover:shadow-medium transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[benefit.category as keyof typeof categoryColors] || 'bg-gray-500 text-white'}`}>
                      {benefit.category}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${benefit.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {benefit.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {benefit.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    -{benefit.discountPercent}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {benefit.validTo.toLocaleDateString('ru-RU')}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <strong>Партнер:</strong> {benefit.partnerName}
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Подробнее
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBenefits.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="text-lg font-medium mb-2">Льготы не найдены</h3>
              <p className="text-sm">Попробуйте изменить параметры поиска</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
