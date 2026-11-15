'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Send, Crown, CheckCircle2, Lightbulb, ShieldCheck, HeartHandshake, ArrowRight, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';
import Navbar from '@/components/Navbar';

// Production lazy loading for heavy canvas background
const TornPaperBackground = dynamic(() => import('@/components/TornPaperBackground'), {
  ssr: false,
});

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What is one thing you admire about me?||What was your very first impression of me?||What's a secret memory you still laugh about?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { toast } = useToast();

  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(() =>
    parseStringMessages(initialMessageString)
  );
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast({
        title: 'Delivered!',
        description: response.data.message || 'Your anonymous message was sent safely.',
      });
      form.reset({ ...form.getValues(), content: '' });
      setIsSent(true);
      setTimeout(() => setIsSent(false), 4000);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data?.message ?? 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    try {
      const response = await axios.post('/api/suggest-messages', {});
      if (response.data && typeof response.data === 'string') {
        const parsed = parseStringMessages(response.data);
        if (parsed.length > 0) {
          setSuggestedQuestions(parsed);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Suggestion Error',
        description: 'Failed to load new questions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggestLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen bg-[#0b0b0e] text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black relative pt-16 overflow-y-auto lg:overflow-hidden">
      {/* Torn Paper Realistic Background */}
      <TornPaperBackground />

      <Navbar className="!z-50" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-3 sm:py-5 relative z-10 flex flex-col justify-between min-h-0">

        {/* Top Header Section */}
        <header className="text-center space-y-1.5 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#141419]/90 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold shadow-lg backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>100% End-to-End Anonymous Drop</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-serif drop-shadow-md">
            Send Anonymous Message to{' '}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3 py-0.5 rounded-xl inline-block -rotate-1 shadow-md font-sans">
              @{username}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 font-medium max-w-lg mx-auto">
            @{username} will never know who sent this message. Be kind, honest, or confess your secret!
          </p>
        </header>

        {/* Main Side-by-Side Content Grid for Desktop/iPad, Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-stretch flex-1 min-h-0 my-2 sm:my-3">

          {/* Left Column: Interactive Luxury Message Form (7 cols on Desktop) */}
          <section className="md:col-span-7 flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#131318]/90 to-[#0c0c10]/95 backdrop-blur-md text-white p-4 sm:p-6 shadow-2xl border border-amber-500/30 relative overflow-hidden group">

            {/* Top Bar inside Message Box */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <MessageSquareQuote className="w-4 h-4 text-amber-400" />
                <span>Your Secret Message</span>
              </div>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded-md border border-neutral-800">
                Encrypted
              </span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col justify-between pt-3 space-y-3 min-h-0">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col min-h-0">
                      <FormControl className="flex-1">
                        <Textarea
                          placeholder={`Write something heartfelt, funny, or intriguing for @${username}...`}
                          className="w-full flex-1 resize-none bg-black/70 border-neutral-800 focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400 text-neutral-100 placeholder:text-neutral-500 rounded-xl text-sm sm:text-base p-3.5 leading-relaxed transition-all shadow-inner"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400">
                    <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                    <span>Safe & Private</span>
                  </div>

                  {isLoading ? (
                    <Button disabled className="bg-amber-400/50 text-black font-black rounded-xl h-10 px-5 text-xs">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Delivering...
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading || !messageContent}
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black px-6 h-10 text-xs sm:text-sm rounded-xl shadow-lg border-0 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 mr-2 text-black" />
                      Send Secret Message
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            {isSent && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Message delivered anonymously to @{username}!
              </div>
            )}
          </section>

          {/* Right Column: AI Suggestions & Quick Prompts (5 cols on Desktop) */}
          <section className="md:col-span-5 flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#131318]/90 to-[#0c0c10]/95 backdrop-blur-md text-white p-4 sm:p-5 shadow-2xl border border-amber-500/25 relative overflow-hidden">

            {/* Suggestion Section Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Need Inspiration?
                </h2>
                <p className="text-[11px] text-neutral-400">Click a prompt to load into text box</p>
              </div>

              <Button
                onClick={fetchSuggestedMessages}
                disabled={isSuggestLoading}
                size="sm"
                className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-[11px] font-black rounded-lg h-7 px-2.5 border-0 shadow transition hover:scale-105 shrink-0 cursor-pointer"
              >
                {isSuggestLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Lightbulb className="h-3 w-3 mr-1 fill-amber-400" />
                )}
                New
              </Button>
            </div>

            {/* Prompt Cards Grid */}
            <div className="flex-1 flex flex-col justify-center gap-2 py-2 overflow-y-auto min-h-0">
              {suggestedQuestions.map((msg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleMessageClick(msg)}
                  className="w-full text-left p-2.5 sm:p-3 rounded-xl bg-black/60 hover:bg-black/95 border border-neutral-800 hover:border-amber-400/70 text-neutral-200 hover:text-amber-300 text-xs font-medium transition-all group shadow cursor-pointer flex items-start gap-2 hover:scale-[1.01]"
                >
                  <span className="text-amber-400 font-black text-xs group-hover:translate-x-0.5 transition-transform mt-0.5">
                    →
                  </span>
                  <span className="line-clamp-2 italic leading-relaxed">
                    "{msg}"
                  </span>
                </button>
              ))}
            </div>

            {/* Prompt Footer Tip */}
            <div className="pt-2 border-t border-white/5 text-[10px] text-neutral-400 text-center font-medium shrink-0">
              ⚡ Powered by free AI question generator
            </div>
          </section>

        </div>

        {/* Create Account CTA - Clean Single-line Footer */}
        <footer className="py-2 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <p className="text-xs font-bold text-neutral-300 text-center sm:text-left">
            Want to receive anonymous messages like @{username}?
          </p>
          <Link href="/sign-up">
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-black px-4 py-1.5 h-8 rounded-lg shadow-md border-0 transition hover:scale-105 flex items-center gap-1.5"
            >
              <span>Create Your Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </footer>

      </main>
    </div>
  );
}
