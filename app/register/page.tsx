'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Organization, MembershipApplication } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');

  // Данные первого этапа (email и пароль)
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  // Данные для нового члена профсоюза
  const [newMemberData, setNewMemberData] = useState<Partial<MembershipApplication>>({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: new Date(),
    gender: 'MALE',
    education: '',
    specialties: [],
    positions: [],
    address: {
      index: '',
      region: '',
      municipality: '',
      locality: '',
      street: '',
      house: '',
      apartment: ''
    },
    phone: '',
    additionalPhone: '',
    children: [],
    hobbies: []
  });

  // Данные для поиска существующего члена
  const [searchData, setSearchData] = useState({
    organizationId: '',
    searchTerm: '',
    searchType: 'name' as 'name' | 'email' | 'phone'
  });

  // Загружаем список организаций
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        setLoadingOrgs(true);
        const response = await fetch('/api/organizations/public');
        const data = await response.json();
        if (data.success) {
          setOrganizations(data.organizations);
        } else {
          console.error('Error loading organizations:', data.error);
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
      } finally {
        setLoadingOrgs(false);
      }
    }
    fetchOrganizations();
  }, []);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!authData.email || !authData.password || !authData.confirmPassword) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    if (authData.password !== authData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (authData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (!authData.agreeToTerms) {
      setError('Необходимо согласиться с условиями использования');
      return;
    }

    setStep(2);
  };

  const handleNewMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Сначала регистрируем пользователя
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authData.email,
          password: authData.password,
          firstName: newMemberData.firstName,
          lastName: newMemberData.lastName,
          middleName: newMemberData.middleName,
          phone: newMemberData.phone,
          organizationId: searchData.organizationId
        }),
      });

      const registerData = await registerResponse.json();

      if (registerData.success) {
        // Затем создаем заявление на вступление
        const applicationResponse = await fetch('/api/membership/application', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newMemberData,
            organizationId: searchData.organizationId,
            applicationDate: new Date().toISOString()
          }),
        });

        const applicationData = await applicationResponse.json();

        if (applicationData.success) {
          alert('Регистрация успешна! Заявление отправлено на рассмотрение.');
          router.push('/login');
        } else {
          setError(applicationData.error || 'Ошибка при создании заявления');
        }
      } else {
        setError(registerData.error || 'Ошибка при регистрации');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Поиск существующего члена
      const searchResponse = await fetch('/api/members/search/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: searchData.organizationId,
          searchTerm: searchData.searchTerm,
          searchType: searchData.searchType
        }),
      });

      const searchResult = await searchResponse.json();

      if (searchResult.success && searchResult.members.length > 0) {
        // Если найден, создаем аккаунт с данными пользователя
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: authData.email,
            password: authData.password,
            firstName: searchResult.members[0].firstName, // Используем данные найденного члена
            lastName: searchResult.members[0].lastName,
            middleName: searchResult.members[0].middleName,
            phone: searchResult.members[0].phone,
            organizationId: searchData.organizationId,
            role: 'PRIMARY_MEMBER',
            isExistingMember: true
          }),
        });

        const registerData = await registerResponse.json();

        if (registerData.success) {
          alert('Регистрация успешна! Ваш аккаунт активирован.');
          router.push('/login');
        } else {
          setError(registerData.error || 'Ошибка при регистрации');
        }
      } else {
        setError('Член профсоюза с указанными данными не найден');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const addSpecialty = () => {
    setNewMemberData(prev => ({
      ...prev,
      specialties: [...(prev.specialties || []), '']
    }));
  };

  const addPosition = () => {
    setNewMemberData(prev => ({
      ...prev,
      positions: [...(prev.positions || []), '']
    }));
  };

  const addChild = () => {
    setNewMemberData(prev => ({
      ...prev,
      children: [...(prev.children || []), { name: '', dateOfBirth: new Date() }]
    }));
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Регистрация в системе
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Создайте аккаунт для доступа к профсоюзной платформе
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleStep1Submit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email адрес *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700"
                  placeholder="Введите ваш email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Пароль *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700"
                  placeholder="Придумайте пароль"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Подтвердите пароль *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={authData.confirmPassword}
                  onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700"
                  placeholder="Повторите пароль"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={authData.agreeToTerms}
                onChange={(e) => setAuthData({ ...authData, agreeToTerms: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Я соглашаюсь с{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  условиями использования
                </a>{' '}
                и{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  политикой конфиденциальности
                </a>
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={!authData.agreeToTerms}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  authData.agreeToTerms 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Продолжить
              </button>
            </div>

            <div className="text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Уже есть аккаунт? Войти
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Завершение регистрации
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Выберите способ регистрации в профсоюзе
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 justify-center">
            <button
              onClick={() => setActiveTab('new')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'new'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Вступить в профсоюз
            </button>
            <button
              onClick={() => setActiveTab('existing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'existing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Я уже член профсоюза
            </button>
          </nav>
        </div>

        {activeTab === 'new' ? (
          /* Форма для новых членов */
          <form onSubmit={handleNewMemberSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Заявление на вступление в профсоюз</h3>
              
              {/* Личные данные */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberData.lastName || ''}
                    onChange={(e) => setNewMemberData({ ...newMemberData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Имя *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberData.firstName || ''}
                    onChange={(e) => setNewMemberData({ ...newMemberData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Отчество
                  </label>
                  <input
                    type="text"
                    value={newMemberData.middleName || ''}
                    onChange={(e) => setNewMemberData({ ...newMemberData, middleName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Дата рождения *
                  </label>
                  <input
                    type="date"
                    required
                    value={newMemberData.dateOfBirth ? new Date(newMemberData.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewMemberData({ ...newMemberData, dateOfBirth: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Пол *
                  </label>
                  <select
                    required
                    value={newMemberData.gender || 'MALE'}
                    onChange={(e) => setNewMemberData({ ...newMemberData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="MALE">Мужской</option>
                    <option value="FEMALE">Женский</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newMemberData.phone || ''}
                    onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Выбор организации */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Выберите профсоюзную организацию *
                </label>
                <select
                  required
                  value={searchData.organizationId}
                  onChange={(e) => setSearchData({ ...searchData, organizationId: e.target.value })}
                  disabled={loadingOrgs}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">
                    {loadingOrgs ? 'Загрузка организаций...' : 'Выберите организацию'}
                  </option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Адрес */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3">Адрес проживания *</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Индекс"
                    required
                    value={newMemberData.address?.index || ''}
                    onChange={(e) => setNewMemberData({
                      ...newMemberData,
                      address: { ...newMemberData.address!, index: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Регион"
                    required
                    value={newMemberData.address?.region || ''}
                    onChange={(e) => setNewMemberData({
                      ...newMemberData,
                      address: { ...newMemberData.address!, region: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Населенный пункт"
                    required
                    value={newMemberData.address?.locality || ''}
                    onChange={(e) => setNewMemberData({
                      ...newMemberData,
                      address: { ...newMemberData.address!, locality: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Улица"
                    required
                    value={newMemberData.address?.street || ''}
                    onChange={(e) => setNewMemberData({
                      ...newMemberData,
                      address: { ...newMemberData.address!, street: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Дом"
                    required
                    value={newMemberData.address?.house || ''}
                    onChange={(e) => setNewMemberData({
                      ...newMemberData,
                      address: { ...newMemberData.address!, house: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Квартира"
                    value={newMemberData.address?.apartment || ''}
                    onChange={(e) => setNewMemberData({
                      ...newMemberData,
                      address: { ...newMemberData.address!, apartment: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center mb-4">{error}</div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Отправка...' : 'Подать заявление'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Форма для существующих членов */
          <form onSubmit={handleExistingMemberSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Поиск в базе членов профсоюза</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Выберите профсоюзную организацию *
                  </label>
                  <select
                    required
                    value={searchData.organizationId}
                    onChange={(e) => setSearchData({ ...searchData, organizationId: e.target.value })}
                    disabled={loadingOrgs}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">
                      {loadingOrgs ? 'Загрузка организаций...' : 'Выберите организацию'}
                    </option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Тип поиска
                  </label>
                  <select
                    value={searchData.searchType}
                    onChange={(e) => setSearchData({ ...searchData, searchType: e.target.value as 'name' | 'email' | 'phone' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="name">По имени</option>
                    <option value="email">По email</option>
                    <option value="phone">По телефону</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Поисковый запрос *
                  </label>
                  <input
                    type="text"
                    required
                    value={searchData.searchTerm}
                    onChange={(e) => setSearchData({ ...searchData, searchTerm: e.target.value })}
                    placeholder={searchData.searchType === 'name' ? 'Введите ФИО' : searchData.searchType === 'email' ? 'Введите email' : 'Введите телефон'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center mt-4">{error}</div>
              )}

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Поиск...' : 'Найти и зарегистрироваться'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}