import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  const { input, chatHistory, apiKey, modelName } = await request.json();

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const filteredChatHistory = Array.isArray(chatHistory)
      ? chatHistory.filter(
          (chat) => chat.user.trim() !== '' && chat.bot.trim() !== ''
        )
      : [];

    const messages = filteredChatHistory.length
      ? filteredChatHistory
          .map((chat) => [
            { role: 'user', content: chat.user },
            { role: 'assistant', content: chat.bot },
          ])
          .flat()
      : [];

    messages.push({ role: 'user', content: input });

    const message = await anthropic.messages.create({
      model: modelName,
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