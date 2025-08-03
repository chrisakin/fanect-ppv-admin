export interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  createdAt: string;
  lastLogin: string;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface ProfileFormErrors {
  firstName?: string;
  lastName?: string;
  oldPassword?: string;
  newPassword?: string;
  general?: string;
}