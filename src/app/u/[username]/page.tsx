'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Send, Sparkles, Crown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompletion } from '@ai-sdk/react';
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

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: '/api/suggest-messages',
    initialCompletion: initialMessageString,
  });

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
        description: axiosError.response?.data.message ?? 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    try {
      complete('');
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#facc15] via-[#eab308] to-[#ca8a04] text-black flex flex-col font-sans selection:bg-black selection:text-yellow-300">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10 space-y-8">
        
        {/* Profile Card Header */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-yellow-300 text-xs font-black shadow-lg">
            <Crown className="w-3.5 h-3.5 text-yellow-400" />
            <span>Encrypted Anonymous Drop</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black font-serif">
            Send Anonymous Message to{' '}
            <span className="bg-black text-yellow-400 px-3 py-0.5 rounded-xl inline-block -rotate-1 shadow-md">
              @{username}
            </span>
          </h1>

          <p className="text-base text-neutral-950 font-medium max-w-md mx-auto">
            @{username} will never know who sent this message. Be kind, honest, or confess your secret!
          </p>
        </div>

        {/* Message Input Box */}
        <div className="rounded-2xl bg-black text-white p-6 md:p-8 shadow-2xl relative border border-black">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-wider font-extrabold text-yellow-400">
                      Your Secret Message
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Write something heartfelt or intriguing for @${username}...`}
                        className="resize-none min-h-[140px] bg-neutral-900 border-neutral-800 focus-visible:ring-yellow-400 text-neutral-100 placeholder:text-neutral-500 rounded-xl text-base p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                {isLoading ? (
                  <Button disabled className="bg-yellow-400/50 text-black font-black rounded-xl">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Delivering...
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !messageContent}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-black px-8 py-5 rounded-xl shadow-xl border-0 transition hover:scale-105"
                  >
                    <Send className="w-4 h-4 mr-2 text-black" />
                    Send Secret Message
                  </Button>
                )}
              </div>
            </form>
          </Form>

          {isSent && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              Message delivered anonymously!
            </div>
          )}
        </div>

        {/* Suggestion Section */}
        <div className="rounded-2xl bg-black text-white p-6 md:p-8 space-y-4 shadow-2xl border border-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-yellow-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Need Inspiration?
              </h3>
              <p className="text-xs text-neutral-300 mt-0.5">Click any suggestion below to fill the message box.</p>
            </div>

            <Button
              onClick={fetchSuggestedMessages}
              disabled={isSuggestLoading}
              size="sm"
              className="bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl self-start sm:self-auto border-0 shadow-md"
            >
              {isSuggestLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              )}
              Suggest New Questions
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-2">
            {error ? (
              <p className="text-red-400 text-xs">{error.message}</p>
            ) : (
              parseStringMessages(completion).map((msg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleMessageClick(msg)}
                  className="w-full text-left p-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-yellow-400 text-neutral-200 hover:text-yellow-300 text-xs md:text-sm font-semibold transition-all group shadow-sm"
                >
                  <span className="text-yellow-400 mr-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
                  "{msg}"
                </button>
              ))
            )}
          </div>
        </div>

        {/* Create Account CTA */}
        <div className="text-center py-6 border-t-2 border-black/20 space-y-3">
          <p className="text-sm font-bold text-neutral-950">Want to receive anonymous messages like @{username}?</p>
          <Link href="/sign-up">
            <Button
              className="bg-black hover:bg-neutral-900 text-yellow-400 text-xs font-black px-7 py-3 rounded-xl shadow-lg border-0"
            >
              Create Your Free Message Board
            </Button>
          </Link>
        </div>

      </main>
    </div>
  );
}
