import { GoogleGenAI } from "@google/genai";

export interface ModerationResult {
  isSafe: boolean;
  reason?: string;
  flaggedCategory?: "harassment" | "hate_speech" | "sexual_content" | "profanity" | "violence" | "none";
}

/**
 * Fast local regex fallback covering critical offensive keywords and slang
 * across English and common Hindi/Hinglish abusive patterns.
 */
const PROFANITY_PATTERNS: RegExp[] = [
  // Common English profanity & vulgarity patterns
  /\b(fuck|shit|bitch|bastard|asshole|cunt|dick|whore|slut|pussy|faggot)\b/i,
  // Common Hindi/Hinglish slangs & abuse patterns
  /\b(mc|bc|bkl|bsdk|chutiya|chutiye|madarchod|behenchod|bhenchod|gandu|harami|bhosdike|laude|lodu|randi|kamine|kamina|saale|gaand)\b/i,
];

/**
 * Validates text against local heuristics.
 */
function fastLocalCheck(content: string): ModerationResult {
  const normalized = content.toLowerCase().replace(/[\s\-_.]+/g, " ");

  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSafe: false,
        reason: "Message contains offensive or abusive language.",
        flaggedCategory: "profanity",
      };
    }
  }

  return { isSafe: true, flaggedCategory: "none" };
}

/**
 * Enterprise-grade multi-layer content moderation using Google Gemini AI + heuristic fail-safes.
 *
 * @param content The anonymous message payload to inspect
 * @returns ModerationResult with safety verdict and human-readable feedback
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  const trimmed = content?.trim() || "";

  if (!trimmed) {
    return { isSafe: false, reason: "Message cannot be empty." };
  }

  // Layer 1: Fast local heuristic check (< 1ms execution, no API cost)
  const localVerdict = fastLocalCheck(trimmed);
  if (!localVerdict.isSafe) {
    return localVerdict;
  }

  // Layer 2: Deep semantic analysis via Gemini AI (covers Hinglish, slangs, hate, threats, bypass attempts)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    // If AI key is absent, rely on layer 1 heuristics
    return localVerdict;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `
You are an advanced automated content moderation engine for an anonymous messaging platform.
Analyze the user's message for any of the following:
1. Severe toxicity, verbal abuse, cyberbullying, or harassment.
2. Profanity, slangs, or vulgar abusive words in English, Hindi, or Hinglish (e.g. slangs disguised with leetspeak or altered spelling).
3. Hate speech, discrimination, death threats, or violence.
4. Non-consensual sexual harassment or explicit sexual content.

Rules:
- Friendly banter, creative confessions, honest constructive feedback, jokes, or emotional messages are SAFE.
- Abusive slangs, insults, threats, hate speech, or harassment are NOT SAFE.
- Return ONLY valid JSON with this exact schema:
{"isSafe": boolean, "category": "harassment" | "hate_speech" | "sexual_content" | "profanity" | "violence" | "none", "reason": "concise polite reason if unsafe, otherwise empty string"}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nMessage to evaluate:\n"""${trimmed}"""` }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const outputText = response.text?.trim();
    if (!outputText) {
      return localVerdict;
    }

    const parsed = JSON.parse(outputText) as {
      isSafe: boolean;
      category?: string;
      reason?: string;
    };

    if (parsed.isSafe === false) {
      return {
        isSafe: false,
        reason:
          parsed.reason && parsed.reason.length > 5
            ? parsed.reason
            : "Message contains offensive, abusive, or harmful language.",
        flaggedCategory: (parsed.category as any) || "profanity",
      };
    }

    return { isSafe: true, flaggedCategory: "none" };
  } catch (error) {
    // Graceful degradation: If Gemini API fails/times out, default to safe if local check passed
    console.error("[ModerationService] Gemini evaluation error (falling back to heuristic):", error);
    return localVerdict;
  }
}
