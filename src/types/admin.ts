export enum AdminRolesEnum {
  SUPERADMIN = "Superadmin",
  ASSISTANT = "Assistant"
}

export interface CreateAdminData {
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRolesEnum;
}

export interface CreateAdminFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRolesEnum;
}

export interface CreateAdminFormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  general?: string;
}