'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  HomeIcon,
  NewspaperIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  CalendarIcon,
  BookOpenIcon,
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  UserIcon,
  GiftIcon,
  PlusIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  HandRaisedIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { MenuItem, UserRole } from '@/types';
import { getMenuByRole } from '@/lib/menu-config';
import { useUser } from '@/contexts/UserContext';
import { getRoleLabel as getRoleLabelFromLib } from '@/lib/role-labels';

interface SidebarProps {
  userRole: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Маппинг иконок с более подходящими иконками для профсоюза
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: HomeIcon,
  newspaper: NewspaperIcon,
  checklist: ClipboardDocumentCheckIcon,
  'document-text': DocumentTextIcon,
  'building-office': BuildingOfficeIcon,
  'chat-bubble-left-right': ChatBubbleLeftRightIcon,
  folder: FolderIcon,
  calendar: CalendarIcon,
  'book-open': BookOpenIcon,
  users: UsersIcon,
  'user-group': UserGroupIcon,
  'chart-bar': ChartBarIcon,
  user: UserIcon,
  gift: GiftIcon,
  handshake: HandRaisedIcon,
  plus: PlusIcon,
  'list-bullet': ListBulletIcon,
  'cog-6-tooth': Cog6ToothIcon,
  'shield-check': ShieldCheckIcon,
  'credit-card': CreditCardIcon
};

interface MenuItemComponentProps {
  item: MenuItem;
  isCollapsed: boolean;
  pathname: string;
}

function MenuItemComponent({ item, isCollapsed, pathname }: MenuItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = iconMap[item.icon] || HomeIcon;
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="mb-1">
      <div
        className={`
          flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer
          ${isActive 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }
          ${isCollapsed ? 'justify-center' : ''}
        `}
        onClick={handleClick}
      >
        <Link 
          href={hasChildren ? '#' : item.href}
          className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'flex-1'}`}
          onClick={hasChildren ? (e) => e.preventDefault() : undefined}
        >
          <IconComponent className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="ml-3 text-sm font-medium">{item.label}</span>
          )}
        </Link>
        
        {!isCollapsed && hasChildren && (
          <div className="ml-2">
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      {!isCollapsed && hasChildren && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children!.map((child) => {
            const ChildIconComponent = iconMap[child.icon] || HomeIcon;
            const isChildActive = pathname === child.href;
            
            return (
              <Link
                key={child.id}
                href={child.href}
                className={`
                  flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm
                  ${isChildActive 
                    ? 'bg-blue-700 text-white' 
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <ChildIconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="ml-3">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ userRole, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUser();
  const menuItems = getMenuByRole(user?.role || userRole);


  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        logout(); // Clear user context and cache
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    return getRoleLabelFromLib(role as UserRole) || 'Пользователь';
  };

  return (
    <div className={`
      sidebar h-full flex flex-col transition-all duration-300 ease-in-out bg-gray-900
      ${isCollapsed ? 'w-16' : 'w-64'}
    `} style={{ 
      minWidth: isCollapsed ? '4rem' : '16rem',
      width: isCollapsed ? '4rem' : '16rem',
      flexShrink: 0,
      zIndex: 10,
      backgroundColor: '#1e293b',
      borderRight: '1px solid #334155'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">МС</span>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-white">
                MyUnion
              </h1>
              <p className="text-xs text-gray-400">
                Dashboard
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            // Гамбургер меню (когда sidebar свернут)
            <div className="w-4 h-4">
              <div className="w-full h-0.5 bg-gray-400"></div>
              <div className="w-full h-0.5 bg-gray-400 mt-1"></div>
              <div className="w-full h-0.5 bg-gray-400 mt-1"></div>
            </div>
          ) : (
            // X иконка (когда sidebar развернут)
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              pathname={pathname}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-300" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Пользователь' : 'Иван Иванов'}
                </p>
                <p className="text-xs text-gray-400">
                  {user ? getRoleLabel(user.role) : 'Администратор'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Выйти из системы"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer для свернутого состояния */}
      {isCollapsed && (
        <div className="p-2 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Выйти из системы"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mx-auto" />
          </button>
        </div>
      )}
    </div>
  );
}