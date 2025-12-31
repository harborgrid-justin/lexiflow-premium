export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PARTNER = 'partner',
  SENIOR_ASSOCIATE = 'senior_associate',
  ASSOCIATE = 'associate',
  JUNIOR_ASSOCIATE = 'junior_associate',
  ATTORNEY = 'attorney',
  PARALEGAL = 'paralegal',
  LEGAL_ASSISTANT = 'legal_assistant',
  CLERK = 'clerk',
  INTERN = 'intern',
  ACCOUNTANT = 'accountant',
  BILLING_SPECIALIST = 'billing_specialist',
  IT_ADMIN = 'it_admin',
  STAFF = 'staff',
  USER = 'user',
  CLIENT = 'client'
}

/**
 * @deprecated Use UserRole instead. Kept for backward compatibility.
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SENIOR_PARTNER = 'SENIOR_PARTNER',
  PARTNER = 'PARTNER',
  ASSOCIATE = 'ASSOCIATE',
  PARALEGAL = 'PARALEGAL',
  LEGAL_SECRETARY = 'LEGAL_SECRETARY',
  ADMINISTRATOR = 'ADMINISTRATOR',
  CLIENT_USER = 'CLIENT_USER',
  GUEST = 'GUEST',
}
