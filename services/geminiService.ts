
import { GoogleGenAI, Type } from "@google/genai";
import { Interaction, Customer, RolePlayEvaluation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const EVALUATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestedScripts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          situation: { type: Type.STRING },
          original: { type: Type.STRING },
          better: { type: Type.STRING }
        }
      }
    },
    dimensions: {
      type: Type.OBJECT,
      properties: {
        professionalism: { type: Type.NUMBER },
        empathy: { type: Type.NUMBER },
        probing: { type: Type.NUMBER },
        closing: { type: Type.NUMBER },
        handlingObjections: { type: Type.NUMBER }
      }
    }
  },
  required: ["score", "strengths", "improvements", "dimensions"]
};

export const startRolePlayChat = (customer: Customer, context: string) => {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `
    你现在扮演客户：${customer.name}，职位是 ${customer.role}，在 ${customer.company} 工作。
    性格特征：资深、理性、时间观念极强。
    演练目标：用户（销售）需要说服你考虑他们的方案或达成下一步共识。

    行为准则：
    1. **拒绝敷衍**：如果用户回复过于简短（如少于10个字）或缺乏专业性，请表现出不悦或困惑，例如：“我没太听懂你的意思，这就是你的专业水平吗？”
    2. **真实反馈**：模拟真实的商业阻力。如果你觉得销售没有触及你的痛点，不要轻易妥协。
    3. **引导深度对话**：通过追问来测试用户的需求挖掘能力。
    
    开始时请主动发起一段话，说明你现在的状态。
  `;
  return ai.chats.create({
    model,
    config: { systemInstruction, temperature: 0.9 }
  });
};

export const transcribeAudio = async (base64Data: string, mimeType: string): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const prompt = "请准确转录这段销售人员的语音内容。只需返回转录文本。";
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    }
  });
  return response.text?.trim() || "";
};

export const evaluateRolePlay = async (history: { role: string, text: string }[]): Promise<RolePlayEvaluation> => {
  const model = "gemini-3-pro-preview";
  const content = history.map(h => `${h.role === 'user' ? '销售' : '客户'}: ${h.text}`).join('\n');
  
  const prompt = `
    作为资深销售总监，请严厉且客观地评估以下销售模拟演练。
    
    评估准则（必须严格遵守）：
    1. **识别敷衍**：如果销售人员的回复普遍偏短（例如大多在15字以内）或只是简单的礼貌性回复，总分禁止超过 40 分。
    2. **专业度考核**：检查销售是否使用了诸如 SPIN、利益点转化、同理心倾听等技巧。
    3. **扣分项**：对于缺乏内容、回答敷衍、态度不积极的情况，必须在“改进建议”中直接批评。
    4. **真实性**：不需要为了鼓励而给高分，我们要的是真实的反馈。

    对话记录：\n${content}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: EVALUATION_SCHEMA }
  });
  return JSON.parse(response.text || '{}');
};

// ... (remaining existing analytical functions)
export const analyzeSalesInteraction = async (input: string, audioData?: { data: string, mimeType: string }) => {
  const model = "gemini-3-flash-preview";
  const systemInstruction = "你是一位销售分析师。将语音或文本转化为结构化销售报告。务必提供详细的摘要和具体的下一步行动建议。";
  const parts: any[] = [{ text: input || "分析此次互动" }];
  if (audioData) parts.push({ inlineData: audioData });
  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: { systemInstruction, responseMimeType: "application/json", responseSchema: {
        type: Type.OBJECT,
        properties: {
          customerProfile: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              industry: { type: Type.STRING },
              summary: { type: Type.STRING },
            },
            required: ["name", "summary"]
          },
          intelligence: {
            type: Type.OBJECT,
            properties: {
              painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyInterests: { type: Type.ARRAY, items: { type: Type.STRING } },
              currentStage: { type: Type.STRING },
              probability: { type: Type.NUMBER },
              nextSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    action: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    dueDate: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["painPoints", "currentStage", "nextSteps"]
          },
          metrics: {
            type: Type.OBJECT,
            properties: {
              talkRatio: { type: Type.NUMBER },
              questionRate: { type: Type.NUMBER },
              sentiment: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER }
            }
          },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["customerProfile", "intelligence", "metrics", "suggestions"]
      } 
    }
  });
  return JSON.parse(response.text || '{}');
};

export const parseScheduleVoice = async (text: string): Promise<any> => {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `你是一个日程助理。从用户的描述中提取日程信息。当前日期是 ${new Date().toISOString().split('T')[0]}。
  如果用户说“明天”，请计算具体日期。`;
  const response = await ai.models.generateContent({
    model,
    contents: `提取此日程: "${text}"`,
    config: { systemInstruction, responseMimeType: "application/json", responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "日程主题，如：拜访、开会" },
        date: { type: Type.STRING, description: "日期格式 YYYY-MM-DD" },
        time: { type: Type.STRING, description: "时间格式 HH:mm" },
        customerName: { type: Type.STRING, description: "提到的客户姓名或公司名" },
        description: { type: Type.STRING, description: "额外备注内容" }
      },
      required: ["title", "date"]
    } }
  });
  return JSON.parse(response.text || '{}');
};

export const extractSearchKeywords = async (text: string): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `从以下语音中提取搜索关键词（如人名、公司）："${text}"。只返回关键词，不要其他描述。`,
  });
  return response.text?.trim() || "";
};

export const parseCustomerVoiceInput = async (text: string) => {
  const model = "gemini-3-flash-preview";
  const systemInstruction = "提取客户姓名、公司、职位、行业。";
  const response = await ai.models.generateContent({
    model,
    contents: text,
    config: { systemInstruction, responseMimeType: "application/json", responseSchema: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        company: { type: Type.STRING },
        role: { type: Type.STRING },
        industry: { type: Type.STRING }
      },
      required: ["name", "company"]
    }}
  });
  return JSON.parse(response.text || '{}');
};
