// Extracted from backend/app/api/v1/endpoints/rpa.py & data_export.py

export const FIELD_SELECTORS: Record<string, any> = {
  personal_info_1: {
    surname: "#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_SURNAME",
    given_names: "#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_GIVEN_NAME",
    full_name_native: "#ctl00_SiteContentPlaceHolder_FormView1_tbxAPP_FULL_NAME_NATIVE",
    sex: "input[name='ctl00$SiteContentPlaceHolder$FormView1$rblAPP_GENDER']",
    marital_status: "#ctl00_SiteContentPlaceHolder_FormView1_ddlAPP_MARITAL_STATUS",
    date_of_birth: {
      day: "#ctl00_SiteContentPlaceHolder_FormView1_ddlDOBDay",
      month: "#ctl00_SiteContentPlaceHolder_FormView1_ddlDOBMonth",
      year: "#ctl00_SiteContentPlaceHolder_FormView1_ddlDOBYear",
    },
    city_of_birth: "#ctl00_SiteContentPlaceHolder_FormView1_tbxDOB_CITY",
    state_province_of_birth: "#ctl00_SiteContentPlaceHolder_FormView1_tbxDOB_STATE",
    country_of_birth: "#ctl00_SiteContentPlaceHolder_FormView1_ddlDOB_CNTRY",
  },
  passport: {
    passport_number: "#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_NUM",
    passport_book_number: "#ctl00_SiteContentPlaceHolder_FormView1_tbxPPT_BOOK_NUM",
    issuing_country: "#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_ISSUED_CNTRY",
    issue_date: {
      day: "#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_ISSUEDDay",
      month: "#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_ISSUEDMonth",
      year: "#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_ISSUEDYear",
    },
    expiry_date: {
      day: "#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_EXPIREDay",
      month: "#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_EXPIREMonth",
      year: "#ctl00_SiteContentPlaceHolder_FormView1_ddlPPT_EXPIREYear",
    },
  }
};

// Map internal country codes to DS-160 select values if needed
export const COUNTRY_MAPPING: Record<string, string> = {
  "CHINA": "CHIN",
  "USA": "USA",
  // ... add more as needed
};

