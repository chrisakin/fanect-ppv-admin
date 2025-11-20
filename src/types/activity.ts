/**
 * UserActivity
 * Single activity log entry describing a user's action in the system.
 */
export interface UserActivity {
  _id: string;
  eventData: string;
  component: 'event' | 'auth' | 'feedback' | 'streampass' | 'withdrawal';
  activityType: string;
  createdAt: string;
  userName: string;
}

/**
 * UserActivitiesResponse
 * Paginated response returned when fetching activity logs.
 */
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

/**
 * ActivityFilters
 * Filters used to query activity logs (component, search term, date range).
 */
export interface ActivityFilters {
  component: string;
  searchTerm: string;
  startDate: string;
  endDate: string;
}