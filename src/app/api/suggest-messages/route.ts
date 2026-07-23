import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // const { messages } = await req.json();
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


    const stream = await client.responses.create({
      model: "gpt-5",
      input: prompt,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "response.output_text.delta" &&
              event.delta
            ) {
              controller.enqueue(encoder.encode(event.delta));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
