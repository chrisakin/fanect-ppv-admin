export interface UserActivity {
  _id: string;
  eventData: string;
  component: 'event' | 'auth' | 'feedback' | 'streampass' | 'withdrawal';
  activityType: string;
  createdAt: string;
  userName: string;
}

export interface UserActivitiesResponse {
  message: string;
  docs: UserActivity[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  limit: number;
}

export interface ActivityFilters {
  component: string;
  searchTerm: string;
  startDate: string;
  endDate: string;
}