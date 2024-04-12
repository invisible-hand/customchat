import axios from 'axios';

export async function POST(request) {
  const { input } = await request.json();

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/complete',
      {
        prompt: input,
        model: 'claude-v1',
        max_tokens_to_sample: 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.CLAUDE_API_KEY,
        },
      }
    );

    const botResponse = response.data.completion;
    return new Response(JSON.stringify({ response: botResponse }), {
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