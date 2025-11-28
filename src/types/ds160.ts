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

  // Part 2: Personal Information 2
  personal_info_2: {
    nationality?: string;
    national_id_number?: string;
    us_social_security_number?: string;
    us_taxpayer_id_number?: string;
  };

  // Part 3: Address & Phone
  address_and_phone: {
    home_street_address?: string;
    home_city?: string;
    home_state_province?: string;
    home_postal_zone?: string;
    home_country?: string;
    mobile_phone?: string;
    email_address?: string;
  };

  // Part 4: Passport
  passport: {
    passport_number?: string;
    passport_book_number?: string;
    issuing_country?: string;
    issue_date?: string;
    expiry_date?: string;
  };

  // Part 5: Travel
  travel: {
    purpose_of_trip?: string; // B1/B2 etc.
    intended_date_of_arrival?: string;
    intended_length_of_stay?: string;
    address_staying_in_us?: string;
    paying_for_trip?: string; // SELF, OTHER_PERSON, etc.
  };

  // Part 6: Travel Companions
  travel_companions: {
    traveling_with_others?: boolean;
    companion_surname?: string;
    companion_given_names?: string;
  };

  // Part 7: Previous US Travel
  previous_us_travel: {
    has_been_to_us?: boolean;
    has_us_visa?: boolean;
    has_been_refused?: boolean;
  };

  // Part 8: US Contact
  us_contact: {
    contact_person_surname?: string;
    contact_person_given_names?: string;
    organization_name?: string;
    relationship?: string;
    us_address?: string;
    phone_number?: string;
    email_address?: string;
  };

  // Part 9: Family
  family: {
    father_surname?: string;
    father_given_names?: string;
    father_date_of_birth?: string;
    mother_surname?: string;
    mother_given_names?: string;
    mother_date_of_birth?: string;
    spouse_surname?: string;
    spouse_given_names?: string;
    spouse_date_of_birth?: string;
  };

  // Part 10: Work/Education/Training
  work_education: {
    primary_occupation?: string;
    present_employer_name?: string;
    present_employer_address?: string;
    monthly_income?: string;
    job_duties?: string;
  };

  // Part 11: Security
  security: {
    has_communicable_disease?: boolean; // Default NO
    has_criminal_record?: boolean; // Default NO
    // ... usually we default these to NO and ask user to verify
  };

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
