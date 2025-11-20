/**
 * AdminRolesEnum
 * Available roles for admin users in the system.
 */
export enum AdminRolesEnum {
  SUPERADMIN = "Super Admin",
  ASSISTANT = "Assistant"
}

/**
 * CreateAdminData
 * Payload required to create a new admin account.
 */
export interface CreateAdminData {
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRolesEnum;
}

/**
 * CreateAdminFormData
 * Form data shape used by admin creation UI.
 */
export interface CreateAdminFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRolesEnum;
}

/**
 * CreateAdminFormErrors
 * Validation error shape for the create-admin form.
 */
export interface CreateAdminFormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  general?: string;
}