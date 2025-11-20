/**
 * UserProfile
 * Authenticated user's profile information returned by the API.
 */
export interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  createdAt: string;
  lastLogin: string;
}

/**
 * UpdateProfileData
 * Payload used to update a user's first and last name.
 */
export interface UpdateProfileData {
  firstName: string;
  lastName: string;
}

/**
 * ChangePasswordData
 * Payload for updating a user's password.
 */
export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

/**
 * ProfileFormErrors
 * Client-side validation error shape for profile forms.
 */
export interface ProfileFormErrors {
  firstName?: string;
  lastName?: string;
  oldPassword?: string;
  newPassword?: string;
  general?: string;
}