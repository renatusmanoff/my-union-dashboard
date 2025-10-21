'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [results, setResults] = useState<Array<{test: string, result: unknown, time: number, timestamp: string}>>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: unknown, time: number) => {
    setResults(prev => [...prev, { test, result, time, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Тест 1: Проверка базового API
    const start1 = Date.now();
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store'
      });
      const data = await response.json();
      addResult('API /api/auth/me', { status: response.status, data }, Date.now() - start1);
    } catch (error) {
      addResult('API /api/auth/me', { error: error.message }, Date.now() - start1);
    }

    // Тест 2: Проверка cookies
    const start2 = Date.now();
    try {
      const cookies = document.cookie;
      addResult('Cookies', { cookies }, Date.now() - start2);
    } catch (error) {
      addResult('Cookies', { error: error.message }, Date.now() - start2);
    }

    // Тест 3: Проверка localStorage
    const start3 = Date.now();
    try {
      const localData = {
        user: localStorage.getItem('user'),
        authToken: localStorage.getItem('auth-token')
      };
      addResult('LocalStorage', localData, Date.now() - start3);
    } catch (error) {
      addResult('LocalStorage', { error: error.message }, Date.now() - start3);
    }

    // Тест 4: Проверка sessionStorage
    const start4 = Date.now();
    try {
      const sessionData = {
        tempUser: sessionStorage.getItem('tempUser')
      };
      addResult('SessionStorage', sessionData, Date.now() - start4);
    } catch (error) {
      addResult('SessionStorage', { error: error.message }, Date.now() - start4);
    }

    // Тест 5: Проверка подключения к базе данных
    const start5 = Date.now();
    try {
      const response = await fetch('/api/admin/system-stats', {
        credentials: 'include',
        cache: 'no-store'
      });
      const data = await response.json();
      addResult('API /api/admin/system-stats', { status: response.status, data }, Date.now() - start5);
    } catch (error) {
      addResult('API /api/admin/system-stats', { error: error.message }, Date.now() - start5);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Диагностика системы</h1>
        
        <button
          onClick={runTests}
          disabled={loading}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Запуск тестов...' : 'Запустить диагностику'}
        </button>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{result.test}</h3>
                <span className="text-sm text-gray-400">{result.time}ms</span>
              </div>
              <pre className="text-sm text-gray-300 bg-gray-700 p-2 rounded overflow-auto">
                {JSON.stringify(result.result, null, 2)}
              </pre>
              <div className="text-xs text-gray-500 mt-1">
                {result.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}