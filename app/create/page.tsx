// app/create/page.tsx
'use client';
import { useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { clientConfig } from '@/config/client';

export default function CreatePage() {
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_SETUP_AGENT_ID;
      if (!agentId) { alert('Setup agent not configured'); return; }
      await conversation.startSession({ agentId });
    } catch (error) { console.error('Failed to start:', error); alert('Could not access microphone'); }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const { status, isSpeaking } = conversation;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Create Interview Panel</h1>
        <p className="text-slate-400 mb-8">Talk to our AI assistant to set up your custom interview panel.</p>
        
        <div className="relative mb-8">
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all ${status === 'connected' ? (isSpeaking ? 'bg-green-500/20 ring-4 ring-green-500/50' : 'bg-purple-500/20 ring-4 ring-purple-500/50') : 'bg-slate-800'}`}>
            {status === 'connecting' ? <Loader2 className="w-12 h-12 text-purple-400 animate-spin" /> : status === 'connected' ? <Mic className="w-12 h-12 text-white" /> : <MicOff className="w-12 h-12 text-slate-500" />}
          </div>
          {status === 'connected' && <p className="mt-4 text-sm text-slate-400">{isSpeaking ? 'AI is speaking...' : 'Listening...'}</p>}
        </div>

        {status !== 'connected' ? (
          <button onClick={startConversation} disabled={status === 'connecting'} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium disabled:opacity-50 transition-colors">
            {status === 'connecting' ? 'Connecting...' : 'Start Setup'}
          </button>
        ) : (
          <button onClick={stopConversation} className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors">End Session</button>
        )}
      </div>
    </div>
  );
}