export interface User {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
  password?: string;
  role: string;
  groups?: string[] | Group[]; // Array of group IDs or populated Group objects
  createdAt?: string;
}

export interface Medication {
  _id?: string;
  name: string;
  dosage: string;
  manufacturer?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceUser {
  _id: string;
  name: string;
  dateOfBirth: string;
  nhsNumber: string;
  address: string;
  phoneNumber: string;
  group?: string | Group;
  emergencyContact: {
    name?: string;
    relationship?: string;
    phoneNumber?: string;
  };
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ActiveMedication {
  _id: string;
  serviceUser: ServiceUser | string;
  medicationName: string;
  dosage: {
    amount: number;
    unit: string;
  };
  quantityInStock: number;
  quantityPerDose: number;
  dosesPerDay: number;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  notes?: string;
  isActive: boolean;
  lastUpdated: Date;
  updatedBy: string;
  daysRemaining: number;
}

export interface MedicationUpdate {
  _id: string;
  medication: {
    _id: string;
    medicationName: string;
  };
  updatedBy: {
    _id: string;
    username: string;
    email: string;
  };
  updateType: "created" | "updated" | "deactivated" | "deleted";
  changes: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
  timestamp: string;
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface Appointment {
  _id: string;
  serviceUser: ServiceUser | string;
  appointmentType: "Medical" | "Dental" | "Therapy" | "Review" | "Other";
  dateTime: string;
  duration: number;
  location: string;
  provider: {
    name?: string;
    role?: string;
    contactNumber?: string;
  };
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "NoShow";
  notes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
  updatedBy?: string;
}
