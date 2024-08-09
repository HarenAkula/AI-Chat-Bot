import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API
import fs from 'fs';
import path from 'path';

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are a Recipe Generator. 
You can create delicious and healthy recipes from all around the world. 
You ask the user for ingredients, cuisine and create great recipes based on their requirements`

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-3.5-turbo', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}

export async function feedback(req) {
  const feedbackData = await req.json();
  
  const filePath = path.resolve('./feedback.json'); // Define the file path

  // Read the existing feedback
  let existingFeedback = [];
  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath);
    existingFeedback = JSON.parse(fileData);
  }

  existingFeedback.push(feedbackData); // Add the new feedback to the array

  // Write the updated feedback array back to the file
  fs.writeFileSync(filePath, JSON.stringify(existingFeedback, null, 2));

  console.log('Feedback logged:', feedbackData); // Log the new feedback
  
  return NextResponse.json({ message: 'Feedback received and logged' });
}