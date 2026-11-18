import { GoogleGenAI } from "@google/genai";

export interface ModerationResult {
  isSafe: boolean;
  reason?: string;
  flaggedCategory?: "harassment" | "hate_speech" | "sexual_content" | "profanity" | "violence" | "none";
}

/**
 * Enterprise-grade dictionary of regex patterns covering critical offensive keywords
 * across English, Hindi/Hinglish, and Odia/Odienglish slangs.
 */
const PROFANITY_PATTERNS: RegExp[] = [
  // 1. English profanity & vulgarities
  /\b(fuck|shit|bitch|bastard|asshole|cunt|dick|whore|slut|pussy|faggot|motherfucker)\b/i,

  // 2. Hindi / Hinglish slangs & abuse patterns
  /\b(mc|bc|bkl|bsdk|chutiya|chutiye|madarchod|behenchod|bhenchod|matherchod|matherchood|gandu|harami|bhosdike|laude|lodu|randi|kamine|kamina|saale|bhoosada|bhosda|bhosoda|aulat|gaand)\b/i,

  // 3. Odia / Odienglish slangs & vulgarities (Latin script / English alphabet)
  /\b(maghia|maghiaa|maagiha|magiha|magiha chhua |banda|banda chhua|bedhabija|bapagiha|bapaghia|khaniki|magia|gandia|gandi|baalia|balia|khandia|randipua|randi\s*pua|bhadua|bhaduwa|chudua|chuduwa|bapara|behesara|jhanta|dhana|dhada|beda|bedha|padara|puduru|bokachoda|bokachuda|chhodi|ka|pua|poa|chodi|choda|bhalu|thiki)\b/i,

  // 4. Odia script slangs (Unicode / Odia script)
  /(ମାଗିଆ|ଗାଣ୍ଡିଆ|ଗାଣ୍ଡି|ବାଳିଆ|ରାଣ୍ଡିପୁଅ|ଭଦୁଆ|ଛୁଦୁଆ|ଝାଣ୍ଟ|ବେଢା)/u,
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
        reason: "Message contains offensive or abusive language (English/Hindi/Odia).",
        flaggedCategory: "profanity",
      };
    }
  }

  return { isSafe: true, flaggedCategory: "none" };
}

/**
 * Enterprise-grade multi-layer content moderation using Google Gemini AI + heuristic fail-safes.
 * Covers English, Hindi, Hinglish, Odia, and Odienglish (Odia written in Latin script).
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

  // Layer 2: Deep semantic analysis via Gemini AI (covers Odia, Odienglish, Hinglish, disguised slangs, threats)
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
2. Profanity, abusive slangs, or vulgar words in:
   - English
   - Hindi / Hinglish
   - Odia / Odienglish (Odia language written in English alphabet, such as common Odia slangs e.g. "maghia", "gandia", "randipua", "bhadua", "baalia", "jhanta", etc.)
3. Hate speech, discrimination, death threats, or violence.
4. Non-consensual sexual harassment or explicit sexual content.

Rules:
- Friendly banter, creative confessions, honest constructive feedback, jokes, or emotional messages are SAFE.
- Abusive slangs, vulgarities, insults, threats, hate speech, or harassment in ANY language (especially Odia/Odienglish, Hindi, or English) are STRICTLY NOT SAFE.
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
