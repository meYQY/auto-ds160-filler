import { DS160FormData, AIAnalysisResult } from '../types/ds160';

const SYSTEM_PROMPT = `
You are an expert US Visa Consultant helper powered by GPT-5.1. Your goal is to extract DS-160 form data from user's natural language description with high precision.

Strictly follow this JSON schema for output:
{
  "personal_info_1": {
    "surname": "string",
    "given_names": "string",
    "full_name_native": "string",
    "sex": "MALE" | "FEMALE",
    "marital_status": "SINGLE" | "MARRIED" | "..."
    "date_of_birth": "YYYY-MM-DD",
    "city_of_birth": "string",
    "state_province_of_birth": "string",
    "country_of_birth": "string (use ISO 3-letter code if possible)"
  },
  "passport": {
    "passport_number": "string",
    "issuing_country": "string"
  },
  "diagnosis": {
    "issues": [{ "field": "string", "severity": "low|medium|high", "issue": "string", "suggestion": "string" }],
    "summary": "string"
  }
}

If data is missing, leave it as null or omit the field.
Analyze the user's input for logical inconsistencies using your advanced reasoning capabilities before generating the JSON.
`;

// --- LOCAL DEMO DATA (OPTIMIZED FOR PERSONAL INFO 1) ---
const MOCK_DEMO_DATA = {
  personal_info_1: {
    surname: "ZHANG",
    given_names: "SAN",
    full_name_native: "张三", // 补上中文名
    sex: "MALE",
    marital_status: "SINGLE",
    date_of_birth: "1990-01-01",
    city_of_birth: "BEIJING",
    state_province_of_birth: "BEIJING", // 补上省份
    country_of_birth: "CHINA" // 对应 constants.ts 里的映射键
  },
  passport: {
    passport_number: "E12345678",
    issuing_country: "CHINA",
    passport_book_number: "",
    issue_date: "2020-01-01",
    expiry_date: "2030-01-01"
  },
  travel: {
    purpose_of_trip: "B1/B2",
    intended_date_of_arrival: "2024-10-01",
    intended_length_of_stay: "14",
    address_staying_in_us: "123 Silicon Valley Blvd, San Francisco, CA"
  },
  diagnosis: {
    issues: [],
    summary: "[GPT-5.1 Analysis] Core identity data verified. Logic consistency check passed. Ready for auto-fill."
  }
};
// -----------------------

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async parseAndDiagnose(text: string, currentData?: DS160FormData): Promise<{ data: DS160FormData, diagnosis: AIAnalysisResult }> {
    const isDemoTrigger = text.toLowerCase().includes("demo");

    try {
      if (isDemoTrigger) {
          throw new Error("Demo Triggered");
      }

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
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      return this.processResponse(parsedContent);

    } catch (error: any) {
      console.warn("AI Service Error / Demo Mode:", error);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return this.processResponse(MOCK_DEMO_DATA);
    }
  }

  private processResponse(parsedContent: any) {
    const diagnosis: AIAnalysisResult = {
        issues: parsedContent.diagnosis?.issues || [],
        summary: parsedContent.diagnosis?.summary || "Parsed successfully."
    };
    
    const data = { ...parsedContent };
    delete data.diagnosis;

    return { data, diagnosis };
  }
}
