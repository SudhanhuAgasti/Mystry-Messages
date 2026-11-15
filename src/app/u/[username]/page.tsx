'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Send, Sparkles, Crown, CheckCircle2 } from 'lucide-react';
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
import TornPaperBackground from '@/components/TornPaperBackground';

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
    <div className="min-h-screen bg-[#0b0b0e] text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black relative pt-16">
      {/* Torn Paper Realistic Background */}
      <TornPaperBackground />

      <Navbar className="!z-50" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 space-y-8 relative z-10">

        {/* Profile Card Header */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141419]/90 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-xl backdrop-blur-md">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Encrypted Anonymous Drop</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white font-serif drop-shadow-lg">
            Send Anonymous Message to{' '}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3.5 py-0.5 rounded-2xl inline-block -rotate-1 shadow-xl">
              @{username}
            </span>
          </h1>

          <p className="text-base text-neutral-300 font-medium max-w-md mx-auto">
            @{username} will never know who sent this message. Be kind, honest, or confess your secret!
          </p>
        </div>

        {/* Message Input Box */}
        <div className="rounded-2xl bg-[#0f0f14]/85 backdrop-blur-md text-white p-6 md:p-8 shadow-2xl relative border border-amber-500/30">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                      Your Secret Message
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Write something heartfelt or intriguing for @${username}...`}
                        className="resize-none min-h-[140px] bg-black/80 border-neutral-800 focus-visible:ring-amber-400 text-neutral-100 placeholder:text-neutral-500 rounded-xl text-base p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                {isLoading ? (
                  <Button disabled className="bg-amber-400/50 text-black font-black rounded-xl">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Delivering...
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !messageContent}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black px-8 py-5 rounded-xl shadow-xl border-0 transition hover:scale-105"
                  >
                    <Send className="w-4 h-4 mr-2 text-black" />
                    Send Secret Message
                  </Button>
                )}
              </div>
            </form>
          </Form>

          {isSent && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              Message delivered anonymously!
            </div>
          )}
        </div>

        {/* Suggestion Section */}
        <div className="rounded-2xl bg-[#0f0f14]/85 backdrop-blur-md text-white p-6 md:p-8 space-y-4 shadow-2xl border border-amber-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Need Inspiration?
              </h3>
              <p className="text-xs text-neutral-300 mt-0.5">Click any suggestion below to fill the message box.</p>
            </div>

            <Button
              onClick={fetchSuggestedMessages}
              disabled={isSuggestLoading}
              size="sm"
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-black rounded-xl self-start sm:self-auto border-0 shadow-md"
            >
              {isSuggestLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              )}
              Suggest New Questions ??
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-2">
            {suggestedQuestions.map((msg, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleMessageClick(msg)}
                className="w-full text-left p-4 rounded-xl bg-black/60 hover:bg-black/90 border border-neutral-800 hover:border-amber-400 text-neutral-200 hover:text-amber-300 text-xs md:text-sm font-semibold transition-all group shadow-sm cursor-pointer"
              >
                <span className="text-amber-400 mr-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
                "{msg}"
              </button>
            ))}
          </div>
        </div>

        {/* Create Account CTA */}
        <div className="text-center py-6 border-t border-amber-500/20 space-y-3">
          <p className="text-sm font-bold text-neutral-300">Want to receive anonymous messages like @{username}?</p>
          <Link href="/sign-up">
            <Button
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-xs font-black px-7 py-3 rounded-xl shadow-lg border-0"
            >
              Create Your Free Message Board
            </Button>
          </Link>
        </div>

      </main>
    </div>
  );
}
