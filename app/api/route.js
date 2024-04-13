import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  const { input, chatHistory } = await request.json();

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const messages = chatHistory.map((chat) => [
      { role: 'user', content: chat.user },
      { role: 'assistant', content: chat.bot },
    ]).flat();

    messages.push({ role: 'user', content: input });

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      // claude-3-haiku-20240307
      // claude-3-sonnet-20240229
      // claude-3-opus-20240229
      max_tokens: 1024,
      messages,
    });

    return new Response(JSON.stringify({ response: message.content[0].text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


