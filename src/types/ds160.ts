export interface DS160FormData {
  // Part 1: Personal Information 1
  personal_info_1: {
    surname?: string;
    given_names?: string;
    full_name_native?: string;
    sex?: 'MALE' | 'FEMALE';
    marital_status?: 'SINGLE' | 'MARRIED' | 'LEGALLY_SEPARATED' | 'DIVORCED' | 'WIDOWED';
    date_of_birth?: string; // YYYY-MM-DD
    city_of_birth?: string;
    state_province_of_birth?: string;
    country_of_birth?: string;
  };

  // Part 2: Passport
  passport: {
    passport_number?: string;
    passport_book_number?: string;
    issuing_country?: string;
    issue_date?: string;
    expiry_date?: string;
  };

  // Part 3: Travel Info (Simplified for demo)
  travel_info: {
    purpose_of_trip?: string; // e.g., 'B'
    specify_purpose?: string; // e.g., 'B1/B2'
    intended_date_of_arrival?: string;
    intended_length_of_stay?: string;
    address_staying_us?: string;
  };

  // ... allow extension for other fields
  [key: string]: any;
}

export interface AIAnalysisResult {
  issues: {
    field: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    issue: string;
    suggestion: string;
  }[];
  summary: string;
}

