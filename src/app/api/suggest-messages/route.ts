import OpenAI from "openai";

const fallbackQuestionSets = [
  "What's your favorite memory from school or college?||What's one thing you can't live without?||If you had 24 hours to do anything, what would you do?",
  "What is your dream travel destination?||What song do you listen to on repeat?||What is something that always brightens your day?",
  "What's the best piece of advice you've ever received?||Are you an early bird or a night owl?||What superpower would you choose and why?",
  "What's your favorite comfort food?||What movie or series can you rewatch anytime?||What's one hobby you've always wanted to try?",
  "If you could have dinner with anyone alive or dead, who would it be?||What makes you laugh the most?||What's your proudest achievement so far?"
];

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey.includes("your-openai-api-key")) {
      const randomIndex = Math.floor(Math.random() * fallbackQuestionSets.length);
      return new Response(fallbackQuestionSets[randomIndex], {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const client = new OpenAI({ apiKey });

    const prompt = `
Create a list of three open-ended and engaging questions formatted as a single string.

Requirements:
- Return exactly 3 questions.
- Separate each question with "||".
- Suitable for an anonymous social messaging platform similar to Qooh.me.
- Avoid personal, controversial, or sensitive topics.
- Focus on fun, universal, and conversation-starting questions.
- Do not include numbering, bullet points, quotes, or any extra text.
- Return only the single string.

Example output:
What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that always makes you smile?
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const result = response.choices[0]?.message?.content?.trim() || fallbackQuestionSets[0];

    return new Response(result, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    if (error?.status === 429) {
      console.warn("⚠️ OpenAI quota exhausted or unavailable. Serving fallback suggestions.");
    } else {
      console.error("⚠️ OpenAI error:", error?.message || error);
    }

    // Graceful fallback questions so button always works
    const randomIndex = Math.floor(Math.random() * fallbackQuestionSets.length);
    return new Response(fallbackQuestionSets[randomIndex], {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

