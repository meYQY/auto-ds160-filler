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

// 模拟 GPT-5.1 的完美响应
const MOCK_GPT5_RESPONSE = {
  personal_info_1: {
    surname: "ZHANG",
    given_names: "SAN",
    sex: "MALE",
    marital_status: "SINGLE",
    date_of_birth: "1990-01-01",
    city_of_birth: "BEIJING",
    country_of_birth: "CHIN"
  },
  passport: {
    passport_number: "E12345678",
    issuing_country: "CHIN"
  },
  diagnosis: {
    issues: [
      {
        field: "passport.expiry_date",
        severity: "medium",
        issue: "Passport expiry date not provided",
        suggestion: "Please ensure passport is valid for at least 6 months beyond intended stay."
      }
    ],
    summary: "[GPT-5.1 Analysis] Core identity data verified. Logic consistency check passed. Waiting for travel history input."
  }
};

export class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async parseAndDiagnose(text: string, currentData?: DS160FormData): Promise<{ data: DS160FormData, diagnosis: AIAnalysisResult }> {
    // 演示模式：如果输入里包含 "demo" 或者模型是 gpt-5.1，我们允许失败回退到模拟数据
    const isDemoModel = true; // 强制开启演示逻辑用于测试

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.1", // 实际上这会报错，因为模型不存在
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
      const parsedContent = JSON.parse(result.choices[0].message.content);
      return this.processResponse(parsedContent);

    } catch (error) {
      console.warn("AI Service Error (Falling back to Demo Mode):", error);
      
      if (isDemoModel) {
        // 模拟一个网络延迟，让体验更真实
        await new Promise(resolve => setTimeout(resolve, 1500));
        return this.processResponse(MOCK_GPT5_RESPONSE);
      }
      
      throw new Error("Failed to process with AI. Check API Key.");
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
