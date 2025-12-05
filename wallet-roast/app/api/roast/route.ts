import { streamText } from 'ai';
import { xai } from '@ai-sdk/xai';
import { z } from 'zod';
import { buildRoastPrompt, buildUserPrompt, type Intensity } from '@/lib/grok/prompts';

export const runtime = 'edge';

// Rate limiting: Simple in-memory store (for edge runtime)
// In production, use Redis or similar persistent store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

// Validate wallet address format (0x + 40 hex chars, case insensitive)
const walletAddressRegex = /^0x[a-fA-F0-9]{40}$/i;

const requestSchema = z.object({
  portfolio: z.object({
    totalValueUSD: z.number().min(0).max(1e15), // Reasonable max value
    tokenCount: z.number().int().min(0).max(10000),
    balances: z.array(
      z.object({
        asset: z.string().max(100), // Some token names can be longer
        balance_usd: z.number(),
      })
    ).max(500), // Allow more tokens
  }),
  intensity: z.enum(['mild', 'spicy', 'nuclear']),
  walletAddress: z.string().regex(walletAddressRegex, 'Invalid wallet address format'),
  ensName: z.string().max(100).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Check rate limit
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { portfolio, intensity, walletAddress } = requestSchema.parse(body);

    const systemPrompt = buildRoastPrompt(portfolio, intensity as Intensity);
    const userPrompt = buildUserPrompt(walletAddress);

    const result = streamText({
      model: xai('grok-3-mini'),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 300,
      temperature: 0.9, // Higher temperature for more creative roasts
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    // Log error server-side only (don't expose details to client)
    console.error('Roast API error:', error);

    if (error instanceof z.ZodError) {
      // Don't expose validation details - generic message only
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to generate roast' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
