'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptChange: (text: string) => void;
}

export default function VoiceRecorder({ onTranscriptChange }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-IN'; // Defaults to English with Indian accent fallback, can accept other langs

        recog.onstart = () => {
          setIsRecording(true);
          setError(null);
        };

        recog.onerror = (event: any) => {
          console.error('Speech recognition error', event);
          setError(event.error === 'not-allowed' ? 'Microphone access denied' : 'Speech recognition failed');
          setIsRecording(false);
        };

        recog.onend = () => {
          setIsRecording(false);
        };

        recog.onresult = (event: any) => {
          let interimText = '';
          let finalText = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript;
            } else {
              interimText += event.results[i][0].transcript;
            }
          }

          setInterimTranscript(interimText);
          if (finalText) {
            setFinalTranscript((prev) => {
              const updated = prev + ' ' + finalText;
              onTranscriptChange(updated.trim());
              return updated;
            });
          }
        };

        setRecognition(recog);
      } else {
        setError('Voice typing is not supported by your browser. We recommend using Google Chrome.');
      }
    }
  }, [onTranscriptChange]);

  const toggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      setInterimTranscript('');
      recognition.start();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-5 rounded-xl border border-white/5 bg-zinc-900/35">
      {/* Microphone Visualizer Circle */}
      <div className="relative flex items-center justify-center">
        {isRecording && (
          <>
            <span className="absolute h-20 w-20 animate-ping rounded-full bg-red-500/10 border border-red-500/20" />
            <span className="absolute h-16 w-16 animate-pulse rounded-full bg-red-500/25 border border-red-500/30" />
          </>
        )}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={!!error && !recognition}
          className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300 shadow-lg ${
            isRecording
              ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-red-600/20'
              : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white'
          }`}
        >
          {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
      </div>

      {/* Helper text / transcripts */}
      <div className="text-center w-full max-w-sm space-y-1">
        <p className="text-xs font-semibold text-zinc-400">
          {isRecording ? 'Listening... Speak clearly.' : 'Click to start voice dictation'}
        </p>

        {/* Live transcription bubble */}
        {isRecording && (interimTranscript || finalTranscript) && (
          <div className="mt-2 text-xs text-indigo-300 animate-pulse bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-2.5 max-h-[80px] overflow-y-auto">
            {interimTranscript || 'Processing voice...'}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/15 p-2 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
