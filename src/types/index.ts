export interface PriceItem {
  label: string;
  price: number;
}

export interface Step {
  step: number;
  title: string;
  desc: string;
}

export interface Service {
  id: number;
  category: string;
  title: string;
  subtitle: string;
  price: number;
  duration: string;
  image: string;
  description: string;
  priceBreakdown: PriceItem[];
  steps: Step[];
}

export interface Appointment {
  id: string;
  service: string;
  pet: string;
  petType: string;
  petDisplay: string;
  petEmoji: string;
  date: string;
  time: string;
  status: "success" | "cancelled";
  price: number;
  address: string;
  vet: string;
}

export interface AdminAppt {
  id: string;
  customer: string;
  pet: string;
  service: string;
  date: string;
  time: string;
  status: "success" | "cancelled";
}

export interface CategoryOption {
  id: string;
  label: string;
}

export interface PetOption {
  value: string;
  label: string;
  emoji: string;
}

export interface StatusMeta {
  label: string;
  bg: string;
  color: string;
}
