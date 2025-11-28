// Extracted from backend/app/api/v1/endpoints/rpa.py & extensive research
// Most IDs follow pattern: #ctl00_SiteContentPlaceHolder_FormView1_...
import { COUNTRIES, RELATIONSHIPS, VISA_CLASSES, MARITAL_STATUS } from './constants';

const PREFIX = "#ctl00_SiteContentPlaceHolder_FormView1_";

export const FIELD_SELECTORS: Record<string, any> = {
  personal_info_1: {
    surname: `${PREFIX}tbxAPP_SURNAME`,
    given_names: `${PREFIX}tbxAPP_GIVEN_NAME`,
    full_name_native: `${PREFIX}tbxAPP_FULL_NAME_NATIVE`,
    sex: `input[name$='rblAPP_GENDER']`, 
    marital_status: { selector: `${PREFIX}ddlAPP_MARITAL_STATUS`, mapping: MARITAL_STATUS },
    date_of_birth: {
      day: `${PREFIX}ddlDOBDay`,
      month: `${PREFIX}ddlDOBMonth`,
      year: `${PREFIX}ddlDOBYear`,
    },
    city_of_birth: `${PREFIX}tbxDOB_CITY`,
    state_province_of_birth: `${PREFIX}tbxDOB_STATE`,
    country_of_birth: { selector: `${PREFIX}ddlDOB_CNTRY`, mapping: COUNTRIES },
  },
  personal_info_2: {
    nationality: { selector: `${PREFIX}ddlNAT_nationality`, mapping: COUNTRIES },
    national_id_number: `${PREFIX}tbxNAT_ID_NUM`,
    us_social_security_number: `${PREFIX}tbxSSN_NUM`,
    us_taxpayer_id_number: `${PREFIX}tbxTAX_NUM`,
  },
  address_and_phone: {
    home_street_address: `${PREFIX}tbxAPP_ADDR_LN1`,
    home_city: `${PREFIX}tbxAPP_ADDR_CITY`,
    home_state_province: `${PREFIX}tbxAPP_ADDR_STATE`,
    home_postal_zone: `${PREFIX}tbxAPP_ADDR_POSTAL_CD`,
    home_country: { selector: `${PREFIX}ddlAPP_ADDR_CNTRY`, mapping: COUNTRIES },
    mobile_phone: `${PREFIX}tbxAPP_MOBILE_TEL`,
    email_address: `${PREFIX}tbxAPP_EMAIL_ADDR`,
  },
  passport: {
    passport_number: `${PREFIX}tbxPPT_NUM`,
    passport_book_number: `${PREFIX}tbxPPT_BOOK_NUM`,
    issuing_country: { selector: `${PREFIX}ddlPPT_ISSUED_CNTRY`, mapping: COUNTRIES },
    issue_date: {
      day: `${PREFIX}ddlPPT_ISSUEDDay`,
      month: `${PREFIX}ddlPPT_ISSUEDMonth`,
      year: `${PREFIX}ddlPPT_ISSUEDYear`,
    },
    expiry_date: {
      day: `${PREFIX}ddlPPT_EXPIREDay`,
      month: `${PREFIX}ddlPPT_EXPIREMonth`,
      year: `${PREFIX}ddlPPT_EXPIREYear`,
    },
  },
  travel: {
    purpose_of_trip: { selector: `${PREFIX}ddlTRAVEL_PURPOSE`, mapping: VISA_CLASSES },
    intended_date_of_arrival: {
      day: `${PREFIX}ddlARRIVALDay`,
      month: `${PREFIX}ddlARRIVALMonth`,
      year: `${PREFIX}ddlARRIVALYear`,
    },
    intended_length_of_stay: `${PREFIX}tbxSTAY_LENGTH`,
    address_staying_in_us: `${PREFIX}tbxSTAY_ADDR_LN1`,
    paying_for_trip: `${PREFIX}ddlPAYER`,
  },
  travel_companions: {
    traveling_with_others: `input[name$='rblOTHER_PERSONS_TRAVELING']`,
    companion_surname: `${PREFIX}tbxOTHER_PERSON_SURNAME`,
    companion_given_names: `${PREFIX}tbxOTHER_PERSON_GIVEN_NAME`,
  },
  previous_us_travel: {
    has_been_to_us: `input[name$='rblPREV_US_TRAVEL']`,
    has_us_visa: `input[name$='rblPREV_US_VISA']`,
    has_been_refused: `input[name$='rblPREV_VISA_REFUSED']`,
  },
  us_contact: {
    contact_person_surname: `${PREFIX}tbxUS_CONTACT_SURNAME`,
    contact_person_given_names: `${PREFIX}tbxUS_CONTACT_GIVEN_NAME`,
    organization_name: `${PREFIX}tbxUS_CONTACT_ORG`,
    relationship: { selector: `${PREFIX}ddlUS_CONTACT_REL`, mapping: RELATIONSHIPS },
    us_address: `${PREFIX}tbxUS_CONTACT_ADDR_LN1`,
    phone_number: `${PREFIX}tbxUS_CONTACT_PHONE`,
    email_address: `${PREFIX}tbxUS_CONTACT_EMAIL`,
  },
  family: {
    father_surname: `${PREFIX}tbxFATHER_SURNAME`,
    father_given_names: `${PREFIX}tbxFATHER_GIVEN_NAME`,
    father_date_of_birth: {
      day: `${PREFIX}ddlFATHER_DOBDay`,
      month: `${PREFIX}ddlFATHER_DOBMonth`,
      year: `${PREFIX}ddlFATHER_DOBYear`,
    },
    mother_surname: `${PREFIX}tbxMOTHER_SURNAME`,
    mother_given_names: `${PREFIX}tbxMOTHER_GIVEN_NAME`,
    mother_date_of_birth: {
      day: `${PREFIX}ddlMOTHER_DOBDay`,
      month: `${PREFIX}ddlMOTHER_DOBMonth`,
      year: `${PREFIX}ddlMOTHER_DOBYear`,
    },
    spouse_surname: `${PREFIX}tbxSPOUSE_SURNAME`,
    spouse_given_names: `${PREFIX}tbxSPOUSE_GIVEN_NAME`,
  },
  work_education: {
    primary_occupation: `${PREFIX}ddlPRESENT_OCCUPATION`,
    present_employer_name: `${PREFIX}tbxPRESENT_EMPLOYER`,
    present_employer_address: `${PREFIX}tbxPRESENT_EMPLOYER_ADDR_LN1`,
    monthly_income: `${PREFIX}tbxPRESENT_INCOME`,
    job_duties: `${PREFIX}tbxPRESENT_DUTIES`,
  },
  security: {
    has_communicable_disease: `input[name$='rblSECURITY_DISEASE']`,
    has_criminal_record: `input[name$='rblSECURITY_CRIMINAL']`,
  }
};

export { COUNTRIES, RELATIONSHIPS, VISA_CLASSES, MARITAL_STATUS };
