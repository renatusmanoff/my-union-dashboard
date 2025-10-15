// Типы организаций
export type OrganizationType = 'FEDERAL' | 'REGIONAL' | 'LOCAL' | 'PRIMARY';

// Отрасли профсоюзов
export type UnionIndustry = 
  | 'EDUCATION'           // Образование и наука
  | 'HEALTHCARE'          // Здравоохранение
  | 'OIL_GAS'            // Нефтяная и газовая промышленность
  | 'METALLURGY'         // Металлургия
  | 'TRANSPORT'          // Транспорт
  | 'CONSTRUCTION'       // Строительство
  | 'COMMUNICATIONS'     // Связь
  | 'ENERGY'             // Энергетика
  | 'AGRICULTURE'        // Сельское хозяйство
  | 'TRADE'              // Торговля
  | 'CULTURE'            // Культура
  | 'SPORT'              // Спорт
  | 'DEFENSE'            // Оборонная промышленность
  | 'CHEMICAL'           // Химическая промышленность
  | 'TEXTILE'            // Легкая промышленность
  | 'FOOD'               // Пищевая промышленность
  | 'FORESTRY'           // Лесная промышленность
  | 'MINING'             // Горнодобывающая промышленность
  | 'MACHINE_BUILDING'   // Машиностроение
  | 'FINANCE'            // Финансы и банковское дело
  | 'PUBLIC_SERVICE';    // Государственная служба

// Типы ролей по уровням организаций
export type FederalRole = 
  | 'FEDERAL_CHAIRMAN'                    // 1.1. Председатель
  | 'FEDERAL_VICE_CHAIRMAN'               // 1.2. Заместитель председателя
  | 'FEDERAL_CHIEF_ACCOUNTANT'           // 1.3. Главный бухгалтер
  | 'FEDERAL_ACCOUNTANT'                 // 1.4. Бухгалтер
  | 'FEDERAL_DEPARTMENT_HEAD'            // 1.5. Начальник управления
  | 'FEDERAL_OFFICE_HEAD'                // 1.6. Начальник отдела
  | 'FEDERAL_SPECIALIST'                 // 1.7. Специалист
  | 'FEDERAL_PRESIDIUM_MEMBER'           // 1.8. Член Президиума ЦК Профсоюза
  | 'FEDERAL_PLENUM_MEMBER'              // 1.9. Член Пленума ЦК Профсоюза
  | 'FEDERAL_YOUTH_CHAIRMAN'             // 1.10. Председатель Молодежного совета
  | 'FEDERAL_YOUTH_VICE_CHAIRMAN'        // 1.11. Заместитель председателя Молодежного совета
  | 'FEDERAL_YOUTH_MEMBER'               // 1.12. Член Молодежного совета
  | 'FEDERAL_AUDIT_CHAIRMAN'             // 1.13. Председатель КРК
  | 'FEDERAL_AUDIT_MEMBER';               // 1.14. Член КРК

export type RegionalRole =
  | 'REGIONAL_CHAIRMAN'                  // 2.1. Председатель
  | 'REGIONAL_VICE_CHAIRMAN'             // 2.2. Заместитель председателя
  | 'REGIONAL_CHIEF_ACCOUNTANT'         // 2.3. Главный Бухгалтер
  | 'REGIONAL_PRESIDIUM_MEMBER'          // 2.4. Член Президиума областного комитета
  | 'REGIONAL_COMMITTEE_MEMBER'          // 2.5. Член областного комитета
  | 'REGIONAL_ACCOUNTANT'                // 2.6. Бухгалтер
  | 'REGIONAL_DEPARTMENT_HEAD'           // 2.7. Заведующий отделом
  | 'REGIONAL_CHIEF_SPECIALIST'          // 2.8. Главный специалист
  | 'REGIONAL_SPECIALIST'                // 2.9. Специалист
  | 'REGIONAL_YOUTH_CHAIRMAN'            // 2.10. Председатель Молодежного совета
  | 'REGIONAL_YOUTH_VICE_CHAIRMAN'       // 2.11. Заместитель председателя Молодежного совета
  | 'REGIONAL_YOUTH_MEMBER'              // 2.12. Член Молодежного совета
  | 'REGIONAL_AUDIT_CHAIRMAN'            // 2.13. Председатель КРК
  | 'REGIONAL_AUDIT_MEMBER';              // 2.14. Член КРК

export type LocalRole =
  | 'LOCAL_CHAIRMAN'                     // 3.1. Председатель
  | 'LOCAL_VICE_CHAIRMAN'                // 3.2. Заместитель председателя
  | 'LOCAL_PRESIDIUM_MEMBER'             // 3.3. Член Президиума местной организации
  | 'LOCAL_PLENUM_MEMBER'                // 3.4. Член Пленума местной организации
  | 'LOCAL_ACCOUNTANT'                   // 3.5. Бухгалтер
  | 'LOCAL_SPECIALIST'                   // 3.6. Специалист
  | 'LOCAL_AUDIT_CHAIRMAN'               // 3.7. Председатель КРК
  | 'LOCAL_AUDIT_MEMBER'                 // 3.8. Член КРК
  | 'LOCAL_YOUTH_CHAIRMAN'               // 3.9. Председатель Молодежного совета
  | 'LOCAL_YOUTH_VICE_CHAIRMAN'          // 3.10. Заместитель председателя Молодежного совета
  | 'LOCAL_YOUTH_MEMBER';                 // 3.11. Член Молодежного совета

export type PrimaryRole =
  | 'PRIMARY_CHAIRMAN'                   // 4.1. Председатель
  | 'PRIMARY_VICE_CHAIRMAN'              // 4.2. Заместитель председателя
  | 'PRIMARY_ACCOUNTANT'                 // 4.3. Бухгалтер (казначей)
  | 'PRIMARY_COMMITTEE_MEMBER'           // 4.4. Член Профкома
  | 'PRIMARY_AUDIT_CHAIRMAN'             // 4.5. Председатель КРК
  | 'PRIMARY_AUDIT_MEMBER'               // 4.6. Член КРК
  | 'PRIMARY_YOUTH_CHAIRMAN'             // 4.7. Председатель Молодежного совета
  | 'PRIMARY_YOUTH_VICE_CHAIRMAN'        // 4.8. Заместитель председателя Молодежного совета
  | 'PRIMARY_YOUTH_MEMBER'               // 4.9. Член Молодежного совета
  | 'PRIMARY_MEMBER';                    // 4.10. Член Профсоюза

export type ProfBureauRole =
  | 'PROF_BUREAU_CHAIRMAN'               // 4.a.1. Председатель ПрофБюро
  | 'PROF_BUREAU_VICE_CHAIRMAN'          // 4.a.2. Заместитель председателя ПрофБюро
  | 'PROF_BUREAU_MEMBER';                // 4.a.3. Член ПрофБюро

export type ProfGroupRole =
  | 'PROF_GROUP_ORGANIZER'               // 4.b.1. Профгруппорг
  | 'PROF_GROUP_VICE_ORGANIZER'         // 4.b.2. Заместитель профгрупорга
  | 'PROF_GROUP_MEMBER';                 // 4.b.3. Член профгруппы

// Общий тип роли
export type UserRole = 
  | 'SUPER_ADMIN'
  | FederalRole 
  | RegionalRole 
  | LocalRole 
  | PrimaryRole 
  | ProfBureauRole 
  | ProfGroupRole;

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
  industry: UnionIndustry; // Отрасль профсоюза
  parentId?: string; // Для иерархии организаций
  parentName?: string;
  address: string;
  phone: string;
  email: string;
  chairmanId?: string; // ID председателя организации
  chairmanName?: string;
  inn?: string; // ИНН организации
  membersCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс для заявления на вступление в профсоюз
export interface MembershipApplication {
  id: string;
  // Личные данные
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  photo?: string;
  
  // Образование и работа
  education: string;
  specialties: string[]; // Множественные специальности
  positions: string[]; // Множественные должности
  
  // Адрес проживания
  address: {
    index: string;
    region: string;
    municipality: string;
    locality: string;
    street: string;
    house: string;
    apartment?: string;
  };
  
  // Контакты
  phone: string;
  additionalPhone?: string;
  email: string;
  
  // Дополнительная информация
  children?: Array<{
    name: string;
    dateOfBirth: Date;
  }>;
  hobbies: string[];
  
  // Данные заявления
  organizationId: string;
  organizationName: string;
  applicationDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  
  // PDF заявления
  pdfUrl?: string;
  
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
