import { DS160FormData, AIAnalysisResult } from '../types/ds160';

const SYSTEM_PROMPT = `
You are an expert US Visa Consultant helper powered by GPT-5.1. Your goal is to extract DS-160 form data from user's natural language description with high precision.

Strictly follow this JSON schema for output:
{
  "personal_info_1": {
    "surname": "string",
    "given_names": "string",
    "sex": "MALE" | "FEMALE",
    "marital_status": "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED",
    "date_of_birth": "YYYY-MM-DD",
    "city_of_birth": "string",
    "country_of_birth": "string (ISO 3-letter code)"
  },
  "personal_info_2": {
    "nationality": "string (ISO 3-letter code)",
    "national_id_number": "string"
  },
  "address_and_phone": {
    "home_street_address": "string",
    "home_city": "string",
    "mobile_phone": "string",
    "email_address": "string"
  },
  "passport": {
    "passport_number": "string",
    "issuing_country": "string (ISO 3-letter code)",
    "issue_date": "YYYY-MM-DD",
    "expiry_date": "YYYY-MM-DD"
  },
  "travel": {
    "purpose_of_trip": "B1/B2",
    "intended_date_of_arrival": "YYYY-MM-DD",
    "intended_length_of_stay": "string"
  },
  "family": {
    "father_surname": "string",
    "father_given_names": "string",
    "mother_surname": "string",
    "mother_given_names": "string"
  },
  "work_education": {
    "primary_occupation": "string",
    "present_employer_name": "string",
    "monthly_income": "string"
  },
  "diagnosis": {
    "issues": [{ "field": "string", "severity": "low|medium|high", "issue": "string", "suggestion": "string" }],
    "summary": "string"
  }
}

If data is missing, leave it as null or omit the field.
Analyze the user's input for logical inconsistencies using your advanced reasoning capabilities before generating the JSON.
`;

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async parseAndDiagnose(text: string, currentData?: DS160FormData): Promise<{ data: DS160FormData, diagnosis: AIAnalysisResult }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.1",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Current Form Data: ${JSON.stringify(currentData || {})}\n\nUser Input: ${text}` }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.statusText} ${errorData.error?.message || ''}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      
      if (!content) {
        throw new Error("No content received from AI");
      }

      const parsedContent = JSON.parse(content);

      // Separate data and diagnosis
      const diagnosis: AIAnalysisResult = {
          issues: parsedContent.diagnosis?.issues || [],
          summary: parsedContent.diagnosis?.summary || "Parsed successfully."
      };
      
      // Clean up the data object
      const data = { ...parsedContent };
      delete data.diagnosis;

      return { data, diagnosis };

    } catch (error: any) {
      console.error("AI Service Error:", error);
      throw new Error(error.message || "Failed to process with AI. Check API Key.");
    }
  }
}
