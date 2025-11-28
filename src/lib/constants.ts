// Official DS-160 Enumerations & Constants
// Extracted from official form data

export const COUNTRIES: Record<string, string> = {
  "CHINA": "CHIN",
  "HONG KONG": "HOKO",
  "TAIWAN": "TAIW",
  "MACAU": "MACU",
  "UNITED STATES": "USA",
  "CANADA": "CANA",
  "UNITED KINGDOM": "GRBR",
  "JAPAN": "JAPA",
  "SOUTH KOREA": "SKOR",
  "GERMANY": "GERM",
  "FRANCE": "FRAN",
  "AUSTRALIA": "AUS",
  "SINGAPORE": "SING",
  "MALAYSIA": "MALA",
  "THAILAND": "THAI",
  "VIETNAM": "VM",
  "INDIA": "IND",
  // ... Common countries, extend as needed
};

export const RELATIONSHIPS: Record<string, string> = {
  "SPOUSE": "S",
  "FIANCE/FIANCEE": "K",
  "CHILD": "C",
  "PARENT": "P",
  "SIBLING": "B",
  "OTHER_RELATIVE": "O",
  "FRIEND": "F",
  "BUSINESS_ASSOCIATE": "U",
  "OTHER": "X",
};

export const VISA_CLASSES: Record<string, string> = {
  "B1": "B1",
  "B2": "B2",
  "B1/B2": "B1/B2",
  "F1": "F1",
  "F2": "F2",
  "J1": "J1",
  "J2": "J2",
  "H1B": "H1B",
  "L1": "L1",
  "O1": "O1",
};

export const MARITAL_STATUS: Record<string, string> = {
  "MARRIED": "M",
  "SINGLE": "S",
  "WIDOWED": "W",
  "DIVORCED": "D",
  "SEPARATED": "L",
  "COMMON_LAW_MARRIAGE": "C",
  "CIVIL_UNION": "P",
};

// Security Questions typically map to "Y" (Yes) or "N" (No)
export const YES_NO: Record<string, string> = {
  "YES": "Y",
  "NO": "N",
};

