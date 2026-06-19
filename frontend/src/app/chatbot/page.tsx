'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { showToast } from '@/components/ui/Toast';
import { Loader } from '@/components/ui/Loader';
import { api } from '@/lib/api';
import { MessageSquare, Send, Sparkles, User, Bot, HelpCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompt suggestions
  const suggestions = [
    'How do I file a grievance regarding water leak?',
    'What is the SLA response time for PWD road repair?',
    'Explain the role of the Ward Committee.',
    'What regulations apply to noise pollution at night?',
  ];

  useEffect(() => {
    if (initialized && !user) {
      router.push('/auth/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const data = await api.post('/chatbot/message', {
        message: textToSend,
        conversationId,
      });

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const botMsg: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(data.timestamp || Date.now()),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      showToast.error(err.message || 'Failed to communicate with AI chatbot');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  if (!initialized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 md:py-8 flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] min-h-[450px] md:min-h-0">
        {/* Header card */}
        <Card className="p-3 md:p-4 mb-4 flex items-center justify-between bg-gradient-to-r from-indigo-950/20 to-cyan-950/20 border-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5.5 w-5.5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-heading text-sm md:text-base font-bold text-white flex items-center gap-1.5">
                <span>AI Civic Assistant</span>
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              </h1>
              <p className="text-zinc-500 text-[10px] md:text-xs">Resolve queries regarding civic bylaws, guidelines, and filing rules.</p>
            </div>
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="flex-1 p-0 overflow-hidden flex flex-col border border-white/5 bg-zinc-950/30">
          {/* Scrollable bubble container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto py-12">
                <div className="h-14 w-14 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-indigo-400">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-white">Ask anything about local civic procedures</h3>
                  <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                    I can assist you with municipal guidelines, explain SLAs for different departments, or guide you on how to structure a new complaint.
                  </p>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 gap-2.5 w-full pt-4">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sug)}
                      className="text-left text-xs p-3 rounded-lg border border-white/5 bg-zinc-900/40 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors flex items-start gap-2"
                    >
                      <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center border ${
                      msg.role === 'user'
                        ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                        : 'bg-zinc-900 border-white/5 text-zinc-300'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-zinc-900/75 border border-white/5 text-zinc-300 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="block text-[9px] text-zinc-500 mt-1.5 text-right font-medium">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* Loading typing bubble */}
            {loading && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center border bg-zinc-900 border-white/5 text-zinc-300">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="bg-zinc-900/75 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form Footer */}
          <form onSubmit={handleSubmit} className="border-t border-white/5 p-4 flex gap-3 bg-zinc-950/45">
            <Input
              placeholder="Ask the AI assistant..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 h-11"
              disabled={loading}
              required
            />
            <Button type="submit" loading={loading} className="px-5 gap-1.5 h-11 shrink-0">
              <span>Send</span>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
