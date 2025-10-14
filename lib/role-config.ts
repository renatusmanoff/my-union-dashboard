import { RoleConfig, OrganizationType, UserRole } from '@/types';

// Конфигурация ролей по типам организаций
export const roleConfigs: RoleConfig[] = [
  {
    organizationType: 'FEDERAL',
    roles: [
      {
        role: 'FEDERAL_CHAIRMAN',
        label: 'Председатель',
        description: 'Руководитель федеральной организации',
        canCreateSubOrganizations: true,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'FEDERAL_VICE_CHAIRMAN',
        label: 'Заместитель председателя',
        description: 'Заместитель руководителя федеральной организации',
        canCreateSubOrganizations: true,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'FEDERAL_CHIEF_ACCOUNTANT',
        label: 'Главный бухгалтер',
        description: 'Главный бухгалтер федеральной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'FEDERAL_ACCOUNTANT',
        label: 'Бухгалтер',
        description: 'Бухгалтер федеральной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'FEDERAL_DEPARTMENT_HEAD',
        label: 'Начальник управления',
        description: 'Начальник управления федеральной организации',
        canCreateSubOrganizations: false,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'FEDERAL_OFFICE_HEAD',
        label: 'Начальник отдела',
        description: 'Начальник отдела федеральной организации',
        canCreateSubOrganizations: false,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'FEDERAL_SPECIALIST',
        label: 'Специалист',
        description: 'Специалист федеральной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'FEDERAL_PRESIDIUM_MEMBER',
        label: 'Член Президиума ЦК Профсоюза',
        description: 'Член Президиума Центрального комитета профсоюза',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: true
      },
      {
        role: 'FEDERAL_PLENUM_MEMBER',
        label: 'Член Пленума ЦК Профсоюза',
        description: 'Член Пленума Центрального комитета профсоюза',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      }
    ]
  },
  {
    organizationType: 'REGIONAL',
    roles: [
      {
        role: 'REGIONAL_CHAIRMAN',
        label: 'Председатель',
        description: 'Руководитель региональной организации',
        canCreateSubOrganizations: true,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'REGIONAL_VICE_CHAIRMAN',
        label: 'Заместитель председателя',
        description: 'Заместитель руководителя региональной организации',
        canCreateSubOrganizations: true,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'REGIONAL_CHIEF_ACCOUNTANT',
        label: 'Главный Бухгалтер',
        description: 'Главный бухгалтер региональной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'REGIONAL_PRESIDIUM_MEMBER',
        label: 'Член Президиума областного комитета',
        description: 'Член Президиума областного комитета',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: true
      },
      {
        role: 'REGIONAL_COMMITTEE_MEMBER',
        label: 'Член областного комитета',
        description: 'Член областного комитета',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'REGIONAL_ACCOUNTANT',
        label: 'Бухгалтер',
        description: 'Бухгалтер региональной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'REGIONAL_DEPARTMENT_HEAD',
        label: 'Заведующий отделом',
        description: 'Заведующий отделом региональной организации',
        canCreateSubOrganizations: false,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'REGIONAL_CHIEF_SPECIALIST',
        label: 'Главный специалист',
        description: 'Главный специалист региональной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'REGIONAL_SPECIALIST',
        label: 'Специалист',
        description: 'Специалист региональной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'REGIONAL_YOUTH_CHAIRMAN',
        label: 'Председатель Молодежного совета',
        description: 'Председатель Молодежного совета региональной организации',
        canCreateSubOrganizations: false,
        canManageMembers: true,
        canValidateMembership: false
      },
      {
        role: 'REGIONAL_YOUTH_VICE_CHAIRMAN',
        label: 'Заместитель председателя Молодежного совета',
        description: 'Заместитель председателя Молодежного совета',
        canCreateSubOrganizations: false,
        canManageMembers: true,
        canValidateMembership: false
      },
      {
        role: 'REGIONAL_YOUTH_MEMBER',
        label: 'Член Молодежного совета',
        description: 'Член Молодежного совета региональной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      }
    ]
  },
  {
    organizationType: 'LOCAL',
    roles: [
      {
        role: 'LOCAL_CHAIRMAN',
        label: 'Председатель',
        description: 'Руководитель местной организации',
        canCreateSubOrganizations: true,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'LOCAL_VICE_CHAIRMAN',
        label: 'Заместитель председателя',
        description: 'Заместитель руководителя местной организации',
        canCreateSubOrganizations: true,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'LOCAL_PRESIDIUM_MEMBER',
        label: 'Член Президиума местной организации',
        description: 'Член Президиума местной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: true
      },
      {
        role: 'LOCAL_PLENUM_MEMBER',
        label: 'Член Пленума местной организации',
        description: 'Член Пленума местной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'LOCAL_ACCOUNTANT',
        label: 'Бухгалтер',
        description: 'Бухгалтер местной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'LOCAL_SPECIALIST',
        label: 'Специалист',
        description: 'Специалист местной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      }
    ]
  },
  {
    organizationType: 'PRIMARY',
    roles: [
      {
        role: 'PRIMARY_CHAIRMAN',
        label: 'Председатель',
        description: 'Руководитель первичной профсоюзной организации',
        canCreateSubOrganizations: true,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'PRIMARY_VICE_CHAIRMAN',
        label: 'Заместитель председателя',
        description: 'Заместитель руководителя первичной организации',
        canCreateSubOrganizations: true,
        canManageMembers: true,
        canValidateMembership: true
      },
      {
        role: 'PRIMARY_ACCOUNTANT',
        label: 'Бухгалтер',
        description: 'Бухгалтер первичной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'PRIMARY_COMMITTEE_MEMBER',
        label: 'Член Профкома',
        description: 'Член профсоюзного комитета первичной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: true
      },
      {
        role: 'PRIMARY_AUDIT_CHAIRMAN',
        label: 'Председатель КРК',
        description: 'Председатель контрольно-ревизионной комиссии',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'PRIMARY_AUDIT_MEMBER',
        label: 'Член КРК',
        description: 'Член контрольно-ревизионной комиссии',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      },
      {
        role: 'PRIMARY_YOUTH_CHAIRMAN',
        label: 'Председатель Молодежного совета',
        description: 'Председатель Молодежного совета первичной организации',
        canCreateSubOrganizations: false,
        canManageMembers: true,
        canValidateMembership: false
      },
      {
        role: 'PRIMARY_YOUTH_VICE_CHAIRMAN',
        label: 'Заместитель председателя Молодежного совета',
        description: 'Заместитель председателя Молодежного совета',
        canCreateSubOrganizations: false,
        canManageMembers: true,
        canValidateMembership: false
      },
      {
        role: 'PRIMARY_YOUTH_MEMBER',
        label: 'Член Молодежного совета',
        description: 'Член Молодежного совета первичной организации',
        canCreateSubOrganizations: false,
        canManageMembers: false,
        canValidateMembership: false
      }
    ]
  }
];

// Роли для структурных подразделений (только для первичных организаций)
export const profBureauRoles = [
  {
    role: 'PROF_BUREAU_CHAIRMAN' as UserRole,
    label: 'Председатель ПрофБюро',
    description: 'Руководитель профсоюзного бюро',
    canCreateSubOrganizations: false,
    canManageMembers: true,
    canValidateMembership: false
  },
  {
    role: 'PROF_BUREAU_VICE_CHAIRMAN' as UserRole,
    label: 'Заместитель председателя ПрофБюро',
    description: 'Заместитель руководителя профсоюзного бюро',
    canCreateSubOrganizations: false,
    canManageMembers: true,
    canValidateMembership: false
  },
  {
    role: 'PROF_BUREAU_MEMBER' as UserRole,
    label: 'Член ПрофБюро',
    description: 'Член профсоюзного бюро',
    canCreateSubOrganizations: false,
    canManageMembers: false,
    canValidateMembership: false
  }
];

export const profGroupRoles = [
  {
    role: 'PROF_GROUP_ORGANIZER' as UserRole,
    label: 'Профгруппорг',
    description: 'Организатор профсоюзной группы',
    canCreateSubOrganizations: false,
    canManageMembers: true,
    canValidateMembership: false
  },
  {
    role: 'PROF_GROUP_VICE_ORGANIZER' as UserRole,
    label: 'Заместитель профгрупорга',
    description: 'Заместитель организатора профсоюзной группы',
    canCreateSubOrganizations: false,
    canManageMembers: true,
    canValidateMembership: false
  },
  {
    role: 'PROF_GROUP_MEMBER' as UserRole,
    label: 'Член профгруппы',
    description: 'Член профсоюзной группы',
    canCreateSubOrganizations: false,
    canManageMembers: false,
    canValidateMembership: false
  }
];

// Функции для работы с ролями
export function getRolesByOrganizationType(organizationType: OrganizationType) {
  const config = roleConfigs.find(c => c.organizationType === organizationType);
  return config ? config.roles : [];
}

export function getRoleConfig(role: UserRole) {
  // Ищем в основных ролях
  for (const config of roleConfigs) {
    const roleConfig = config.roles.find(r => r.role === role);
    if (roleConfig) return roleConfig;
  }
  
  // Ищем в ролях профбюро
  const profBureauRole = profBureauRoles.find(r => r.role === role);
  if (profBureauRole) return profBureauRole;
  
  // Ищем в ролях профгруппы
  const profGroupRole = profGroupRoles.find(r => r.role === role);
  if (profGroupRole) return profGroupRole;
  
  return null;
}

export function canUserCreateSubOrganizations(role: UserRole): boolean {
  const config = getRoleConfig(role);
  return config ? config.canCreateSubOrganizations : false;
}

export function canUserManageMembers(role: UserRole): boolean {
  const config = getRoleConfig(role);
  return config ? config.canManageMembers : false;
}

export function canUserValidateMembership(role: UserRole): boolean {
  const config = getRoleConfig(role);
  return config ? config.canValidateMembership : false;
}

// Функция для получения доступных ролей для создания пользователя
export function getAvailableRolesForCreation(
  userRole: UserRole, 
  organizationType: OrganizationType
): UserRole[] {
  // Супер-администратор может создавать только председателей
  if (userRole === 'SUPER_ADMIN') {
    const chairmanRoles = {
      'FEDERAL': 'FEDERAL_CHAIRMAN',
      'REGIONAL': 'REGIONAL_CHAIRMAN', 
      'LOCAL': 'LOCAL_CHAIRMAN',
      'PRIMARY': 'PRIMARY_CHAIRMAN'
    } as const;
    
    return [chairmanRoles[organizationType]];
  }
  
  // Председатели могут создавать все роли своей организации
  const chairmanRoles = ['FEDERAL_CHAIRMAN', 'REGIONAL_CHAIRMAN', 'LOCAL_CHAIRMAN', 'PRIMARY_CHAIRMAN'];
  if (chairmanRoles.includes(userRole)) {
    const baseRoles = getRolesByOrganizationType(organizationType).map(r => r.role);
    
    // Для первичных организаций добавляем роли структурных подразделений
    if (organizationType === 'PRIMARY') {
      return [
        ...baseRoles,
        ...profBureauRoles.map(r => r.role),
        ...profGroupRoles.map(r => r.role)
      ];
    }
    
    return baseRoles;
  }
  
  // Остальные роли не могут создавать пользователей
  return [];
}

// Функция для проверки, может ли пользователь регистрироваться самостоятельно
export function canSelfRegister(role: UserRole): boolean {
  // Могут регистрироваться только роли от первичной организации и ниже
  const selfRegisterRoles = [
    'PRIMARY_CHAIRMAN',
    'PRIMARY_VICE_CHAIRMAN', 
    'PRIMARY_ACCOUNTANT',
    'PRIMARY_COMMITTEE_MEMBER',
    'PRIMARY_AUDIT_CHAIRMAN',
    'PRIMARY_AUDIT_MEMBER',
    'PRIMARY_YOUTH_CHAIRMAN',
    'PRIMARY_YOUTH_VICE_CHAIRMAN',
    'PRIMARY_YOUTH_MEMBER',
    'PROF_BUREAU_CHAIRMAN',
    'PROF_BUREAU_VICE_CHAIRMAN',
    'PROF_BUREAU_MEMBER',
    'PROF_GROUP_ORGANIZER',
    'PROF_GROUP_VICE_ORGANIZER', 
    'PROF_GROUP_MEMBER',
    'MEMBER'
  ];
  
  return selfRegisterRoles.includes(role);
}
