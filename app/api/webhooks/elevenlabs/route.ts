// app/api/webhooks/elevenlabs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface ParsedPanel { name: string; description: string; tone: string; duration_minutes: number; target_audience: string; interview_type: string; greeting: string; questions: string[]; closing_message: string; }

async function parseTranscriptWithLLM(transcript: string): Promise<ParsedPanel> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'content-type': 'application/json', 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, messages: [{ role: 'user', content: `Parse this setup transcript and return ONLY JSON: {"name":"panel name","description":"1-2 sentences","tone":"professional/friendly","duration_minutes":15,"target_audience":"who","interview_type":"type","greeting":"opening message","questions":["q1","q2","q3"],"closing_message":"thank you"}

Transcript:
${transcript}` }] }),
  });
  if (!response.ok) throw new Error('Claude API error');
  const data = await response.json();
  return JSON.parse(data.content[0].text);
}

async function createElevenLabsAgent(panel: ParsedPanel): Promise<string> {
  const prompt = `You are an AI interviewer for "${panel.name}". Context: ${panel.description}. Tone: ${panel.tone}. Questions: ${panel.questions.map((q,i)=>`${i+1}. ${q}`).join('; ')}. Opening: "${panel.greeting}" Closing: "${panel.closing_message}"`;
  const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: panel.name, conversation_config: { agent: { prompt: { prompt }, first_message: panel.greeting, language: 'en' }, asr: { quality: 'high', provider: 'elevenlabs' }, turn: { turn_timeout: 10, mode: 'turn_based' }, tts: { voice_id: 'JBFqnCBsd6RMkjVDRZzb' } }, platform_settings: { auth: { enable_auth: false } } }),
  });
  if (!response.ok) throw new Error('ElevenLabs error');
  return (await response.json()).agent_id;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    let transcript = '';
    if (payload.type === 'post_call_transcription' && payload.data?.transcript) {
      transcript = payload.data.transcript.map((t: any) => `${t.role}: ${t.message}`).join('\n');
    }
    if (!transcript) return NextResponse.json({ success: true, message: 'No transcript' });
    const config = await parseTranscriptWithLLM(transcript);
    const agentId = await createElevenLabsAgent(config);
    const slug = config.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    const { data: agent, error } = await supabase.from('agents').insert({ name: config.name, slug, description: config.description, elevenlabs_agent_id: agentId, greeting: config.greeting, questions: config.questions, settings: { tone: config.tone, duration_minutes: config.duration_minutes, target_audience: config.target_audience, interview_type: config.interview_type, closing_message: config.closing_message }, status: 'active' }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, agentId: agent.id });
  } catch (error: any) { console.error('Webhook error:', error); return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function GET() { return NextResponse.json({ status: 'active' }); }