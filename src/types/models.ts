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
  form: "tablet" | "capsule" | "injection" | "cream" | "solution" | "other";
  route: "oral" | "intravenous" | "topical" | "other";
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
  instructions?: string;
  notes?: string;
  stockChangeNote?: string;
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
    quantityInStock: number;
    quantityPerDose: number;
    dosesPerDay: number;
    daysRemaining: number;
  };
  updatedBy: {
    _id: string;
    username: string;
    email: string;
  };
  updateType:
    | "New Medication"
    | "MedStock Increase"
    | "MedStock Decrease"
    | "Name Change"
    | "Service User Change"
    | "Quantity Per Dose Change"
    | "Doses Per Day Change"
    | "Prescriber Change"
    | "Dosage Change"
    | "Frequency Change"
    | "Notes Change"
    | "Activated"
    | "Deactivated";
  changes: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
  notes?: string;
  stockChangeNote?: string;
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

export interface Summary {
  _id: string;
  startDate: string;
  endDate: string;
  summaries: {
    serviceUser: {
      _id: string;
      name: string;
      dateOfBirth: string;
      nhsNumber: string;
    };
    medication: {
      _id: string;
      medicationName: string;
      quantityInStock: number;
      quantityPerDose: number;
      dosesPerDay: number;
    };
    stockLevels: {
      initial: number;
      final: number;
      daysRemaining: number;
    };
    cumulativeChanges: {
      fromPharmacy: number;
      quantityAdministered: number;
      leavingHome: number;
      returningHome: number;
      returnedToPharmacy: number;
      lost: number;
      damaged: number;
      other: number;
    };
    changes: {
      type: string;
      quantity: number;
      note: string;
      timestamp: string;
      updatedBy: {
        _id: string;
        username: string;
        email: string;
      };
      _id: string;
    }[];
    _id: string;
  }[];
  createdAt: string;
  __v: number;
}

export interface WeeklySummary {
  _id: string;
  startDate: string;
  endDate: string;
  summaries: {
    serviceUser: {
      _id: string;
      name: string;
      dateOfBirth: string;
      nhsNumber: string;
    };
    medication: {
      _id: string;
      medicationName: string;
      quantityInStock: number;
      quantityPerDose: number;
      dosesPerDay: number;
    };
    stockLevels: {
      initial: number;
      final: number;
      daysRemaining: number;
    };
    cumulativeChanges: {
      fromPharmacy: number;
      quantityAdministered: number;
      leavingHome: number;
      returningHome: number;
      returnedToPharmacy: number;
      lost: number;
      damaged: number;
      other: number;
    };
    changes: {
      type: string;
      quantity: number;
      note: string;
      timestamp: string;
      updatedBy: {
        _id: string;
        username: string;
        email: string;
      };
      _id: string;
    }[];
    _id: string;
  }[];
  createdAt: string;
  __v: number;
}

