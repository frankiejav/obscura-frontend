import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createVercel } from '@ai-sdk/vercel';

export const runtime = 'edge'; // recommended for streaming

const vercel = createVercel({
  apiKey: process.env.V0_API_KEY!, // set in Vercel envs
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const result = await streamText({
    model: vercel('gpt-4o-mini'), // pick an available v0 model
    prompt,
  });

  return result.toAIStreamResponse();
}
