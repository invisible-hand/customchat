"use strict";
const Groq = require("groq-sdk");

export async function POST(request) {
    const { input, chatHistory = [], apiKey } = await request.json();

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY || apiKey
    });

    // Ensure chatHistory is an array and that each chat has a valid role
    const messages = chatHistory.reduce((acc, chat) => {
        if (chat.user.trim() !== '' && chat.bot.trim() !== '') {
            acc.push({ role: 'user', content: chat.user + 'always reply in markdown' });
            acc.push({ role: 'assistant', content: chat.bot });
        }
        return acc;
    }, []);

    // Ensure the new user input is not empty and has a valid role
    if (input.trim() !== '') {
        messages.push({
            role: 'user',
            content: input
        });
    }

    try {
        const response = await groq.chat.completions.create({
            messages: messages,
            model: "llama3-70b-8192" // Ensure you use the correct model ID
        });

        // Extract the last message content from the response
        const lastMessage = response.choices[0]?.message?.content || "";
        return new Response(JSON.stringify({ response: lastMessage }), {
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



// "use strict";
// const Groq = require("groq-sdk");

// export async function POST(request) {
//     const { input, chatHistory, apiKey } = await request.json();

//     const groq = new Groq({
//         apiKey: process.env.GROQ_API_KEY || apiKey
//     });

//     // Convert the existing chat history into the format required by Groq
//     const messages = chatHistory.map(chat => ({
//         role: 'user',
//         content: chat.user
//     }), {
//         role: 'assistant',
//         content: chat.bot
//     }).flat();

//     // Add the new user input to the messages array
//     messages.push({
//         role: 'user',
//         content: input
//     });

//     try {
//         const response = await groq.chat.completions.create({
//             messages: messages,
//             model: "llama3-8b-8192" // Assuming you are using a specific model, adjust as necessary
//         });

//         // Handle the response and format it as needed for the front end
//         const lastMessage = response.choices[0]?.message?.content || "";
//         return new Response(JSON.stringify({ response: lastMessage }), {
//             status: 200,
//             headers: { 'Content-Type': 'application/json' }
//         });
//     } catch (error) {
//         console.error('Error:', error);
//         return new Response(JSON.stringify({ error: 'An error occurred' }), {
//             status: 500,
//             headers: { 'Content-Type': 'application/json' }
//         });
//     }
// }
