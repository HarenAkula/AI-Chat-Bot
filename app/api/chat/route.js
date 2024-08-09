import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are a highly knowledgeable and helpful AI customer support bot for HeadstartAI, a platform specializing in AI-powered technical interviews for software engineering roles. Your primary goal is to assist users with any questions, issues, or concerns they may have regarding the platform, its features, and the interview process.

                      this is their websiter: https://headstarter.co/
                      Provide clear, concise, and informative responses to user inquiries. Offer solutions or direct users to relevant resources whenever possible. Maintain a professional, friendly, and empathetic tone throughout all interactions.

                      Here are some examples of user queries you may encounter:

                      Who is the Founder?
                      Who is the CEO?
                      Where are they located?
                      How do I schedule an interview?
                      I'm having trouble accessing my interview results.
                      What kind of questions are asked in the technical interview?
                      Can I reschedule an interview?
                      How does the platform evaluate my coding skills?
                      Remember to always prioritize user satisfaction and strive to resolve issues efficiently.`

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