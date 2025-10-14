// Типы пользователей и ролей
export type UserRole = 'ADMIN' | 'CENTRAL_COMMITTEE' | 'REGIONAL' | 'LOCAL' | 'PRIMARY';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  type: 'CENTRAL_COMMITTEE' | 'REGIONAL' | 'LOCAL' | 'PRIMARY';
  parentId?: string;
  address: string;
  phone: string;
  email: string;
  director: string;
  membersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  organizationId: string;
  organizationName: string;
  imageUrl?: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeId?: string;
  assigneeName?: string;
  creatorId: string;
  creatorName: string;
  organizationId: string;
  organizationName: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  type: 'INTERNAL' | 'EXTERNAL' | 'REGULATORY';
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  authorId: string;
  authorName: string;
  organizationId: string;
  organizationName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  organizationId: string;
  organizationName: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: Date;
  endDate?: Date;
  budget?: number;
  managerId: string;
  managerName: string;
  organizationId: string;
  organizationName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'MEETING' | 'EVENT' | 'DEADLINE' | 'HOLIDAY';
  organizationId: string;
  organizationName: string;
  attendees: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  organizationId: string;
  organizationName: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: Date;
  salary?: number;
  organizationId: string;
  organizationName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnionMember {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  membershipNumber: string;
  joinDate: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  organizationId: string;
  organizationName: string;
  workplace: string;
  position: string;
  phone: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  title: string;
  type: 'FINANCIAL' | 'MEMBERSHIP' | 'ACTIVITY' | 'STATISTICAL';
  period: string;
  organizationId: string;
  organizationName: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discount {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  category: string;
  partnerId: string;
  partnerName: string;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Partner {
  id: string;
  name: string;
  description: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Типы для навигации
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  children?: MenuItem[];
}

// Типы для API ответов
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Типы для форм
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterStep1Form {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterStep2Form {
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  organizationId: string;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  avatar?: File;
}
