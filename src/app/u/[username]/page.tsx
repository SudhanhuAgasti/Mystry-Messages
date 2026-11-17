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
import Navbar from '@/components/Navbar';

// Schema defined directly inline to eliminate any cross-platform file casing or import resolution mismatch
const messageSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Message cannot be empty" })
    .max(500, { message: "Message must be under 500 characters" }),
});

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

          {/* Left Column: Rich Creamy Blue Message Form Card (7 cols on Desktop) */}
          <section className="md:col-span-7 flex flex-col justify-between rounded-[22px] bg-gradient-to-b from-[#e3f2fd] via-[#bbdefb] to-[#90caf9] text-black p-4 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.8)] border-[2.5px] border-black relative overflow-hidden group">

            {/* Lined Stationery Message Paper Texture Background */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.25] bg-[linear-gradient(to_bottom,transparent_27px,rgba(0,0,0,0.12)_28px)] [background-size:100%_28px]" 
              aria-hidden="true" 
            />

            {/* Vintage Paper Fiber Noise Texture */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]" 
              aria-hidden="true" 
            />

            {/* Top Bar inside Message Box */}
            <div className="relative z-10 flex items-center justify-between pb-2 border-b border-black/15 shrink-0">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black">
                <MessageSquareQuote className="w-4 h-4 text-black" />
                <span>Your Secret Message</span>
              </div>
              <span className="text-[10px] font-black text-black/80 uppercase tracking-widest bg-black/10 px-2.5 py-0.5 rounded-full border border-black/20">
                Encrypted
              </span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10 flex-1 flex flex-col justify-between pt-3 space-y-3 min-h-0">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex flex-col min-h-0">
                      <FormControl className="flex-1">
                        <Textarea
                          placeholder={`Write something heartfelt, funny, or intriguing for @${username}...`}
                          className="w-full flex-1 resize-none bg-white/75 border-black/30 focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black text-black placeholder:text-black/50 rounded-xl text-sm sm:text-base p-3.5 leading-relaxed transition-all shadow-inner font-sans font-semibold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-700 font-bold text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-black/70">
                    <HeartHandshake className="w-3.5 h-3.5 text-black" />
                    <span>Safe & Anonymous</span>
                  </div>

                  {isLoading ? (
                    <Button disabled className="bg-black/40 text-black font-black rounded-xl h-10 px-5 text-xs">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
                      Delivering...
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading || !messageContent}
                      className="bg-black hover:bg-neutral-900 text-white font-black px-6 h-10 text-xs sm:text-sm rounded-xl shadow-xl border-0 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 mr-2 text-cyan-300" />
                      Send Secret Message
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            {isSent && (
              <div className="relative z-10 mt-3 p-2.5 rounded-xl bg-black text-emerald-300 border border-black text-xs font-black flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Message delivered anonymously to @{username}!
              </div>
            )}
          </section>

          {/* Right Column: Rich Creamy Blue AI Suggestions Card (5 cols on Desktop) */}
          <section className="md:col-span-5 flex flex-col justify-between rounded-[22px] bg-gradient-to-b from-[#e3f2fd] via-[#bbdefb] to-[#90caf9] text-black p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.8)] border-[2.5px] border-black relative overflow-hidden">

            {/* Lined Stationery Message Paper Texture Background */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.25] bg-[linear-gradient(to_bottom,transparent_27px,rgba(0,0,0,0.12)_28px)] [background-size:100%_28px]" 
              aria-hidden="true" 
            />

            {/* Vintage Paper Fiber Noise Texture */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]" 
              aria-hidden="true" 
            />

            {/* Suggestion Section Header */}
            <div className="relative z-10 flex items-center justify-between pb-2 border-b border-black/15 shrink-0">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-black flex items-center gap-1.5 uppercase tracking-wide">
                  <Lightbulb className="w-3.5 h-3.5 text-black fill-black" />
                  Need Inspiration?
                </h2>
                <p className="text-[11px] text-black/60 font-semibold">Click a prompt to load into text box</p>
              </div>

              <Button
                onClick={fetchSuggestedMessages}
                disabled={isSuggestLoading}
                size="sm"
                className="bg-black hover:bg-neutral-900 text-white text-[11px] font-black rounded-lg h-7 px-2.5 border-0 shadow transition hover:scale-105 shrink-0 cursor-pointer"
              >
                {isSuggestLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin text-white" />
                ) : (
                  <Lightbulb className="h-3 w-3 mr-1 fill-amber-300 text-amber-300" />
                )}
                New
              </Button>
            </div>

            {/* Prompt Cards Grid */}
            <div className="relative z-10 flex-1 flex flex-col justify-center gap-2 py-2 overflow-y-auto min-h-0">
              {suggestedQuestions.map((msg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleMessageClick(msg)}
                  className="w-full text-left p-2.5 sm:p-3 rounded-xl bg-white/75 hover:bg-white border border-black/25 hover:border-black text-black text-xs font-bold transition-all group shadow-sm cursor-pointer flex items-start gap-2 hover:scale-[1.01]"
                >
                  <span className="text-black font-black text-xs group-hover:translate-x-0.5 transition-transform mt-0.5">
                    →
                  </span>
                  <span className="line-clamp-2 italic leading-relaxed">
                    "{msg}"
                  </span>
                </button>
              ))}
            </div>

            {/* Prompt Footer Tip */}
            <div className="relative z-10 pt-2 border-t border-black/15 text-[10px] text-black/60 text-center font-bold shrink-0">
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
