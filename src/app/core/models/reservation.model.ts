export interface Reservation {
  name: string;
  email: string;
  phoneNumber: string;
  partySize: number;
  hasChildren: boolean;
  willSmoke: boolean;
  date: string;
  time: string;
  selectedTable: string;
  bookingID: string;
}

export interface TimeSlot {
  value: string;
  available: boolean;
}

export interface DateOption {
  value: string;
  available: boolean;
  timeSlots: TimeSlot[];
}

export interface TableOption {
  label: string;
  image: string;
  maxSeats: number;
  childrenAllowed: boolean;
  smokingAllowed: boolean;
  available: boolean;
  dates: DateOption[];
}