import { Groq } from "groq-sdk";

export async function POST(request) {
  const { input, apiKey, modelName } = await request.json();

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || apiKey
  });

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: input }],
      model: modelName || "llama3-70b-8192"
    });

    const summary = response.choices[0]?.message?.content || "";
    return new Response(JSON.stringify({ response: summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}