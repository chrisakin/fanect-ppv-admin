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

export interface FeedbackFilters {
  searchTerm: string;
  startDate: string;
  endDate: string;
}