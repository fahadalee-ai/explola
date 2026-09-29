export type Role = "traveler" | "operator" | "admin";
export type ThemeMode = "system" | "light" | "dark";
export type Currency = "USD" | "GBP" | "EUR" | "AUD" | "ZAR";
export type GroupType = "Private" | "Small group";
export type StayLevel = "Budget" | "Mid-range" | "Luxury";
export type InquiryStatus = "draft" | "sent" | "viewed" | "quoted" | "closed";
export type ListingStatus = "draft" | "published" | "review";

export type Account = {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  bio: string;
  dob: string;
  nationality: string;
  avatar: string;
  marketing: boolean;
  verifiedEmail: boolean;
  operatorId?: string;
  verificationStatus?: "none" | "pending" | "approved";
};

export type TripPrefs = {
  interests: string[];
  countries: string[];
  budget: string;
  timeframe: string;
};

export type Destination = {
  id: string;
  name: string;
  country: string;
  tagline: string;
  image: string;
  description: string;
  highlights: string[];
  facts: { visa: string; currency: string; language: string; climate: string };
  wildlife: string[];
  parks: string[];
  tips: string[];
  months: { month: string; score: number; note: string }[];
  events: { month: number; title: string }[];
  pin: { x: number; y: number };
};

export type Credential = { name: string; detail: string };

export type Operator = {
  id: string;
  name: string;
  location: string;
  country: string;
  established: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  eco: boolean;
  topRated: boolean;
  initials: string;
  cover: string;
  bio: string;
  story: string;
  team: string;
  sustainability: string;
  languages: string[];
  responseTime: string;
  tripsHosted: number;
  credentials: Credential[];
  tourTypes: string[];
  reviewStatus: "approved" | "pending";
  ownerId?: string;
};

export type TourDay = {
  day: number;
  title: string;
  description: string;
  location: string;
  stay: string;
  meals: string;
  activities: string;
  image: string;
};

export type Accommodation = {
  name: string;
  type: string;
  image: string;
  note: string;
};

export type Tour = {
  id: string;
  title: string;
  operatorId: string;
  destinationIds: string[];
  parks: string[];
  image: string;
  images: string[];
  durationDays: number;
  groupType: GroupType;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  priceTo: number;
  categories: string[];
  accommodation: StayLevel;
  description: string;
  highlights: string[];
  wildlife: string[];
  difficulty: string;
  bestMonths: string[];
  languages: string[];
  included: string[];
  excluded: string[];
  cancellation: string;
  days: TourDay[];
  stays: Accommodation[];
  featured?: boolean;
  trending?: boolean;
  status: ListingStatus;
};

export type Review = {
  id: string;
  tourId: string;
  operatorId: string;
  userId: string;
  author: string;
  country: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  tripType: string;
  month: string;
  photos: string[];
  helpful: number;
  reply?: string;
  verified: boolean;
  pending?: boolean;
  recommend: boolean;
};

export type SavedItem = {
  id: string;
  userId: string;
  kind: "tour" | "operator";
  refId: string;
  collection?: string;
};

export type Inquiry = {
  id: string;
  userId: string;
  tourId?: string;
  destinationIds: string[];
  operatorIds: string[];
  flexible: boolean;
  startDate: string;
  endDate: string;
  lengthDays: number;
  adults: number;
  children: number;
  childAges: string;
  travelerType: string;
  accommodation: StayLevel;
  budgetMin: number;
  budgetMax: number;
  interests: string[];
  occasion: string;
  needs: string;
  message: string;
  phone: string;
  contactMethod: string;
  status: InquiryStatus;
  createdAt: string;
  unread: boolean;
  /** Traveler told the operator they want to talk through the quoted price. */
  accepted?: boolean;
};

export type QuoteDraft = {
  tourId?: string;
  destinationId?: string;
  operatorId?: string;
  dests: string[];
  flexible: boolean;
  start: string;
  end: string;
  length: number;
  adults: number;
  children: number;
  ages: string;
  travelerType: string;
  stay: StayLevel;
  budget: [number, number];
  interests: string[];
  occasion: string;
  needs: string;
  message: string;
  phone: string;
  contact: string;
  ops: string[];
  consent: boolean;
};

export type Quote = {
  id: string;
  inquiryId: string;
  operatorId: string;
  price: number;
  inclusions: string;
  validity: string;
  note: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  inquiryId?: string;
  userId: string;
  operatorId: string;
  archived?: boolean;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  from: "traveler" | "operator";
  text: string;
  image?: string;
  createdAt: string;
  read: boolean;
};

export type AppNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
};

export type PlanId = "starter" | "professional" | "premium";

export type Subscription = {
  userId: string;
  planId: PlanId;
  interval: "month" | "year";
  status: "active" | "canceled";
  renewsAt: string;
  last4?: string;
};

export type Invoice = {
  id: string;
  userId: string;
  date: string;
  label: string;
  amount: string;
};

export type Ticket = {
  id: string;
  userId: string;
  topic: string;
  message: string;
  createdAt: string;
};

export type Faq = { id: string; group: string; q: string; a: string };

export type Filters = {
  country: string;
  park: string;
  types: string[];
  duration: [number, number];
  budget: [number, number];
  month: string;
  groupSize: number;
  stay: string;
  activities: string[];
  rating: number;
  verifiedOnly: boolean;
  language: string;
  groupType: string;
};
