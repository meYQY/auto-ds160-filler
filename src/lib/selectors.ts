import { COUNTRIES, RELATIONSHIPS, VISA_CLASSES, MARITAL_STATUS, GENDERS } from './constants';

// Use partial IDs for fuzzy matching to be more robust against ASP.NET ID changes
// We will match elements where id ENDS WITH these strings or CONTAINS them

export const FIELD_SELECTORS: Record<string, any> = {
  personal_info_1: {
    surname: `tbxAPP_SURNAME`,
    given_names: `tbxAPP_GIVEN_NAME`,
    full_name_native: `tbxAPP_FULL_NAME_NATIVE`,
    sex: { selector: `rblAPP_GENDER`, mapping: GENDERS },
    marital_status: { selector: `ddlAPP_MARITAL_STATUS`, mapping: MARITAL_STATUS },
    date_of_birth: {
      day: `ddlDOBDay`,
      month: `ddlDOBMonth`,
      year: `ddlDOBYear`,
    },
    city_of_birth: `tbxDOB_CITY`,
    state_province_of_birth: `tbxDOB_STATE`,
    country_of_birth: { selector: `ddlDOB_CNTRY`, mapping: COUNTRIES },
  },
  personal_info_2: {
    nationality: { selector: `ddlNAT_nationality`, mapping: COUNTRIES },
    national_id_number: `tbxNAT_ID_NUM`,
    us_social_security_number: `tbxSSN_NUM`,
    us_taxpayer_id_number: `tbxTAX_NUM`,
  },
  address_and_phone: {
    home_street_address: `tbxAPP_ADDR_LN1`,
    home_city: `tbxAPP_ADDR_CITY`,
    home_state_province: `tbxAPP_ADDR_STATE`,
    home_postal_zone: `tbxAPP_ADDR_POSTAL_CD`,
    home_country: { selector: `ddlAPP_ADDR_CNTRY`, mapping: COUNTRIES },
    mobile_phone: `tbxAPP_MOBILE_TEL`,
    email_address: `tbxAPP_EMAIL_ADDR`,
  },
  passport: {
    passport_number: `tbxPPT_NUM`,
    passport_book_number: `tbxPPT_BOOK_NUM`,
    issuing_country: { selector: `ddlPPT_ISSUED_CNTRY`, mapping: COUNTRIES },
    issue_date: {
      day: `ddlPPT_ISSUEDDay`,
      month: `ddlPPT_ISSUEDMonth`,
      year: `ddlPPT_ISSUEDYear`,
    },
    expiry_date: {
      day: `ddlPPT_EXPIREDay`,
      month: `ddlPPT_EXPIREMonth`,
      year: `ddlPPT_EXPIREYear`,
    },
  },
  travel: {
    purpose_of_trip: { selector: `ddlTRAVEL_PURPOSE`, mapping: VISA_CLASSES },
    intended_date_of_arrival: {
      day: `ddlARRIVALDay`,
      month: `ddlARRIVALMonth`,
      year: `ddlARRIVALYear`,
    },
    intended_length_of_stay: `tbxSTAY_LENGTH`,
    address_staying_in_us: `tbxSTAY_ADDR_LN1`,
    paying_for_trip: `ddlPAYER`,
  },
  family: {
    father_surname: `tbxFATHER_SURNAME`,
    father_given_names: `tbxFATHER_GIVEN_NAME`,
    father_date_of_birth: {
      day: `ddlFATHER_DOBDay`,
      month: `ddlFATHER_DOBMonth`,
      year: `ddlFATHER_DOBYear`,
    },
    mother_surname: `tbxMOTHER_SURNAME`,
    mother_given_names: `tbxMOTHER_GIVEN_NAME`,
    mother_date_of_birth: {
      day: `ddlMOTHER_DOBDay`,
      month: `ddlMOTHER_DOBMonth`,
      year: `ddlMOTHER_DOBYear`,
    },
    spouse_surname: `tbxSPOUSE_SURNAME`,
    spouse_given_names: `tbxSPOUSE_GIVEN_NAME`,
  },
  work_education: {
    primary_occupation: `ddlPRESENT_OCCUPATION`,
    present_employer_name: `tbxPRESENT_EMPLOYER`,
    present_employer_address: `tbxPRESENT_EMPLOYER_ADDR_LN1`,
    monthly_income: `tbxPRESENT_INCOME`,
    job_duties: `tbxPRESENT_DUTIES`,
  },
  security: {
    has_communicable_disease: `rblSECURITY_DISEASE`,
    has_criminal_record: `rblSECURITY_CRIMINAL`,
  }
};

export { COUNTRIES, RELATIONSHIPS, VISA_CLASSES, MARITAL_STATUS, GENDERS };
