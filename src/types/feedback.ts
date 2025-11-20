/**
 * Feedback
 * Represents a single user feedback entry tied to an event.
 */
export interface Feedback {
  _id: string;
  ratings: number;
  comments?: string;
  createdAt: string;
  __v: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventStatus: string;
  eventAdminStatus: string;
  eventId: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * FeedbackResponse
 * Paginated response wrapper for feedback listing endpoints.
 */
export interface FeedbackResponse {
  message: string;
  docs: Feedback[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  limit: number;
}

/**
 * FeedbackFilters
 * Query filters used when fetching feedback lists (search and date range).
 */
export interface FeedbackFilters {
  searchTerm: string;
  startDate: string;
  endDate: string;
}