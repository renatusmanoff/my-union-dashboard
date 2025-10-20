'use client';

import { useUser } from '@/contexts/UserContext';

export default function DebugPage() {
  const { user, isLoading, error } = useUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug UserContext</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Loading:</h2>
          <p>{isLoading ? 'true' : 'false'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Error:</h2>
          <p>{error || 'null'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">User:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {user ? JSON.stringify(user, null, 2) : 'null'}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">User Role:</h2>
          <p>{user?.role || 'null'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">User Name:</h2>
          <p>{user ? `${user.firstName} ${user.lastName}` : 'null'}</p>
        </div>
      </div>
    </div>
  );
}
