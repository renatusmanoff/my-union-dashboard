// Типы организаций
export type OrganizationType = 'FEDERAL' | 'REGIONAL' | 'LOCAL' | 'PRIMARY';

// Типы ролей по уровням организаций
export type FederalRole = 
  | 'FEDERAL_CHAIRMAN'           // Председатель
  | 'FEDERAL_VICE_CHAIRMAN'      // Заместитель председателя
  | 'FEDERAL_CHIEF_ACCOUNTANT'   // Главный бухгалтер
  | 'FEDERAL_ACCOUNTANT'         // Бухгалтер
  | 'FEDERAL_DEPARTMENT_HEAD'    // Начальник управления
  | 'FEDERAL_OFFICE_HEAD'        // Начальник отдела
  | 'FEDERAL_SPECIALIST'          // Специалист
  | 'FEDERAL_PRESIDIUM_MEMBER'    // Член Президиума ЦК Профсоюза
  | 'FEDERAL_PLENUM_MEMBER';     // Член Пленума ЦК Профсоюза

export type RegionalRole =
  | 'REGIONAL_CHAIRMAN'          // Председатель
  | 'REGIONAL_VICE_CHAIRMAN'     // Заместитель председателя
  | 'REGIONAL_CHIEF_ACCOUNTANT'  // Главный Бухгалтер
  | 'REGIONAL_PRESIDIUM_MEMBER'  // Член Президиума областного комитета
  | 'REGIONAL_COMMITTEE_MEMBER'  // Член областного комитета
  | 'REGIONAL_ACCOUNTANT'         // Бухгалтер
  | 'REGIONAL_DEPARTMENT_HEAD'   // Заведующий отделом
  | 'REGIONAL_CHIEF_SPECIALIST'   // Главный специалист
  | 'REGIONAL_SPECIALIST'         // Специалист
  | 'REGIONAL_YOUTH_CHAIRMAN'     // Председатель Молодежного совета
  | 'REGIONAL_YOUTH_VICE_CHAIRMAN' // Заместитель председателя Молодежного совета
  | 'REGIONAL_YOUTH_MEMBER';     // Член Молодежного совета

export type LocalRole =
  | 'LOCAL_CHAIRMAN'             // Председатель
  | 'LOCAL_VICE_CHAIRMAN'        // Заместитель председателя
  | 'LOCAL_PRESIDIUM_MEMBER'     // Член Президиума местной организации
  | 'LOCAL_PLENUM_MEMBER'        // Член Пленума местной организации
  | 'LOCAL_ACCOUNTANT'           // Бухгалтер
  | 'LOCAL_SPECIALIST';          // Специалист

export type PrimaryRole =
  | 'PRIMARY_CHAIRMAN'           // Председатель
  | 'PRIMARY_VICE_CHAIRMAN'      // Заместитель председателя
  | 'PRIMARY_ACCOUNTANT'         // Бухгалтер
  | 'PRIMARY_COMMITTEE_MEMBER'    // Член Профкома
  | 'PRIMARY_AUDIT_CHAIRMAN'     // Председатель КРК
  | 'PRIMARY_AUDIT_MEMBER'       // Член КРК
  | 'PRIMARY_YOUTH_CHAIRMAN'     // Председатель Молодежного совета
  | 'PRIMARY_YOUTH_VICE_CHAIRMAN' // Заместитель председателя Молодежного совета
  | 'PRIMARY_YOUTH_MEMBER';      // Член Молодежного совета

export type ProfBureauRole =
  | 'PROF_BUREAU_CHAIRMAN'       // Председатель ПрофБюро
  | 'PROF_BUREAU_VICE_CHAIRMAN'  // Заместитель председателя ПрофБюро
  | 'PROF_BUREAU_MEMBER';        // Член ПрофБюро

export type ProfGroupRole =
  | 'PROF_GROUP_ORGANIZER'       // Профгруппорг
  | 'PROF_GROUP_VICE_ORGANIZER'  // Заместитель профгрупорга
  | 'PROF_GROUP_MEMBER';         // Член профгруппы

// Общий тип роли
export type UserRole = 
  | 'SUPER_ADMIN'
  | FederalRole 
  | RegionalRole 
  | LocalRole 
  | PrimaryRole 
  | ProfBureauRole 
  | ProfGroupRole
  | 'MEMBER'; // Член профсоюза (для регистрации)

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
  organizationType: OrganizationType;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  membershipValidated: boolean; // Для членов профсоюза
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  parentId?: string; // Для иерархии организаций
  parentName?: string;
  address: string;
  phone: string;
  email: string;
  chairmanId?: string; // ID председателя организации
  chairmanName?: string;
  membersCount: number;
  isActive: boolean;
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

// Интерфейсы для управления системой
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  isActive: boolean;
  emailVerified: boolean;
  temporaryPassword?: string; // Временный пароль для новых админов
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipValidation {
  id: string;
  userId: string;
  organizationId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: Date;
  validatedAt?: Date;
  validatedBy?: string;
  notes?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'ADMIN_CREATED' | 'MEMBERSHIP_APPROVED' | 'MEMBERSHIP_REJECTED' | 'PASSWORD_RESET';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейсы для структурных подразделений
export interface ProfBureau {
  id: string;
  name: string;
  organizationId: string; // Привязка к первичной организации
  organizationName: string;
  chairmanId?: string;
  chairmanName?: string;
  membersCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfGroup {
  id: string;
  name: string;
  organizationId: string; // Привязка к первичной организации
  organizationName: string;
  profBureauId?: string; // Опциональная привязка к профбюро
  profBureauName?: string;
  organizerId?: string;
  organizerName?: string;
  membersCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс для ролевых конфигураций
export interface RoleConfig {
  organizationType: OrganizationType;
  roles: {
    role: UserRole;
    label: string;
    description: string;
    canCreateSubOrganizations: boolean;
    canManageMembers: boolean;
    canValidateMembership: boolean;
  }[];
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
