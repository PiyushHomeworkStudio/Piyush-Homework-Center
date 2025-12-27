

export type HomeworkStatus = 'Pending' | 'Writing' | 'Delay' | 'Completed';
export type PaymentStatus = 'Paid' | 'Unpaid';
export type PaymentMethod = 'COD' | 'Online';

export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  pin: string;
  isAdmin?: boolean;
}

export interface HomeworkRequest {
  id: string;
  userId: string;
  subject: string;
  pages: number;
  lessons: number;
  calculationType: 'pages' | 'lessons';
  grade: string;
  language: string;
  handwritingStyle: string;
  deliveryDays: number;
  specialInstructions: string;
  estimatedAmount: number;
  originalAmount?: number;
  status: HomeworkStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  seasonId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  homeworkId: string;
  amount: number;
  transactionId?: string;
  screenshot?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  fileData?: string;
  fileName?: string;
  fileType: 'text' | 'image' | 'file';
  timestamp: string;
}

export interface SeasonOffer {
  id: string;
  title: string;
  discount: number;
  theme: 'newyear' | 'summer' | 'diwali';
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  requests: HomeworkRequest[];
  transactions: Transaction[];
  messages: ChatMessage[];
  adminBalance: number;
  activeSeasonId: string | null;
  bannerClicks: number;
  investmentMode: 'machine' | 'watch' | 'monitor' | 'divide';
  adminVerificationPin: string;
  dashboardAccessPin: string;
}