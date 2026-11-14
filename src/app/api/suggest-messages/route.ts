import { GoogleGenAI } from "@google/genai";

const fallbackQuestionSets = [
  "What's your favorite memory from school or college?||What's one thing you can't live without?||If you had 24 hours to do anything, what would you do?",
  "What is your dream travel destination?||What song do you listen to on repeat?||What is something that always brightens your day?",
  "What's the best piece of advice you've ever received?||Are you an early bird or a night owl?||What superpower would you choose and why?",
  "What's your favorite comfort food?||What movie or series can you rewatch anytime?||What's one hobby you've always wanted to try?",
  "If you could have dinner with anyone alive or dead, who would it be?||What makes you laugh the most?||What's your proudest achievement so far?",
  "What's the craziest adventure on your bucket list?||What is your hidden talent no one knows about?||What's a book or movie that changed your mindset?"
];

export async function POST(req: Request) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey.trim() !== "") {
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const prompt = `
Create a list of exactly three fun, engaging, and open-ended questions for an anonymous social messaging profile (similar to Sarahah / NGL).

Requirements:
- Return exactly 3 questions.
- Separate them ONLY with "||".
- Do not use numbers, bullet points, introductory text, quotes or markdown.
-Suitable for an anonymous social messaging platform similarto Qooh.
-be Avoid personal, controversial, or sensitive topics.
-Focus on fun, universal, and conversation-starting questions.
-Do not include numbering, bullet points, quotes, or any extra text.
-Return only the single string.
- Example output: What's your secret dream?||Who was your first crush?||What's the best memory we share?
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text && text.includes("||")) {
        return new Response(text, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    }

    // Default intelligent random rotating questions (Free & Instant)
    const randomIndex = Math.floor(Math.random() * fallbackQuestionSets.length);
    return new Response(fallbackQuestionSets[randomIndex], {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Gemini suggestion error, serving rotating questions:", error?.message || error);
    const randomIndex = Math.floor(Math.random() * fallbackQuestionSets.length);
    return new Response(fallbackQuestionSets[randomIndex], {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
