'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  UserPlusIcon,
  PlusIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { MenuItem, UserRole } from '@/types';
import { getMenuByRole } from '@/lib/menu-config';

interface SidebarProps {
  userRole: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Маппинг иконок
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
  handshake: UserPlusIcon,
  plus: PlusIcon,
  'list-bullet': ListBulletIcon
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
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
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
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-800 dark:text-primary-400' 
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
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
  const menuItems = getMenuByRole(userRole);

  return (
    <div className={`
      sidebar h-full flex flex-col transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">МС</span>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                MyUnion
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dashboard
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            // Гамбургер меню (когда sidebar свернут)
            <div className="w-4 h-4">
              <div className="w-full h-0.5 bg-gray-600 dark:bg-gray-400"></div>
              <div className="w-full h-0.5 bg-gray-600 dark:bg-gray-400 mt-1"></div>
              <div className="w-full h-0.5 bg-gray-600 dark:bg-gray-400 mt-1"></div>
            </div>
          ) : (
            // X иконка (когда sidebar развернут)
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Иван Иванов
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Администратор
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
