"use strict";
const Groq = require("groq-sdk");

export async function POST(request) {
  const formData = await request.formData();
  const input = formData.get('input');
  const chatHistory = JSON.parse(formData.get('chatHistory'));
  const apiKey = formData.get('apiKey');
  const file = formData.get('file');

  console.log("Received file:", file); // Add this line to log the received file

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

  if (file) {
    // Process the uploaded file and include it in the messages array
    messages.push({
      role: 'user',
      content: `File uploaded: ${file.name}`
    });

    // Add this block to log the file data
    console.log("File name:", file.name);
    console.log("File type:", file.type);
    console.log("File size:", file.size);

    // Optionally, you can send the file to an external storage service or API
    // and include the file URL in the messages array
    // const fileUrl = await uploadFileToStorage(file);
    // messages.push({
    //   role: 'user',
    //   content: `File URL: ${fileUrl}`
    // });
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