import { DS160FormData, AIAnalysisResult } from '../types/ds160';

const SYSTEM_PROMPT = `
You are an expert US Visa Consultant helper powered by GPT-5.1. Your goal is to extract DS-160 form data from user's natural language description with high precision.

Strictly follow this JSON schema for output:
{
  "personal_info_1": {
    "surname": "string",
    "given_names": "string",
    "sex": "MALE" | "FEMALE",
    "marital_status": "SINGLE" | "MARRIED" | "..."
    "date_of_birth": "YYYY-MM-DD",
    "city_of_birth": "string",
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
          model: "gpt-5.1", // Or allow user to choose
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Current Form Data: ${JSON.stringify(currentData || {})}\n\nUser Input: ${text}` }
          ],
          response_format: { type: "json_object" }
        })
      });

      const result = await response.json();
      const parsedContent = JSON.parse(result.choices[0].message.content);

      // Separate data and diagnosis (in a real app, we might want structured output for both)
      const diagnosis: AIAnalysisResult = {
          issues: parsedContent.diagnosis?.issues || [],
          summary: parsedContent.diagnosis?.summary || "Parsed successfully."
      };
      
      // Clean up the data object (remove diagnosis field if it leaked in)
      const data = { ...parsedContent };
      delete data.diagnosis;

      return { data, diagnosis };

    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("Failed to process with AI. Check API Key.");
    }
  }
}

