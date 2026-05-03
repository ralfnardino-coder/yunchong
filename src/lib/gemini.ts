import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function getMayorAdvice(studentName: string, level: number, petName: string) {
  if (!ai) return "镇长大人正在出巡，稍后再来找我吧！";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一位可爱甜美的云宠小镇镇长。学生 ${studentName} 的宠物 ${petName} 达到了第 ${level} 级。请给这位学生写一段鼓励的话，语气要亲切、充满活力，包含一些魔法和萌宠元素。字数在50字左右。`,
    });
    return response.text || "太棒了！你的小宠又变强了呢！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "哎呀，魔法感应出错了，但你的进步我一直看在眼里哦！";
  }
}
