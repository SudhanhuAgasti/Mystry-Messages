'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw, Copy, Check, Link as LinkIcon, Inbox, ChevronUp, ChevronDown } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import TornPaperBackground from '@/components/TornPaperBackground';
import Navbar from '@/components/Navbar';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'next' | 'prev'>('next');
  const [isSwiping, setIsSwiping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const { toast } = useToast();

  const handleSwipe = useCallback((direction: 'next' | 'prev') => {
    if (isSwiping) return;
    if (direction === 'next' && activeCardIndex < messages.length - 1) {
      setSwipeDirection('next');
      setIsSwiping(true);
      setTimeout(() => {
        setActiveCardIndex((prev) => prev + 1);
        setIsSwiping(false);
      }, 320);
    } else if (direction === 'prev' && activeCardIndex > 0) {
      setSwipeDirection('prev');
      setIsSwiping(true);
      setTimeout(() => {
        setActiveCardIndex((prev) => prev - 1);
        setIsSwiping(false);
      }, 320);
    }
  }, [activeCardIndex, messages.length, isSwiping]);

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prevMessages) => {
      const updated = prevMessages.filter((message) => message._id.toString() !== messageId);
      if (activeCardIndex >= updated.length && updated.length > 0) {
        setActiveCardIndex(updated.length - 1);
      }
      return updated;
    });
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue(
        'acceptMessages',
        response.data.isAcceptingMessages ?? false
      );
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>('/api/get-messages');
        setMessages(response.data.messages || []);
        if (refresh) {
          toast({
            title: 'Messages Refreshed',
            description: 'Showing latest anonymous feedback',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error',
          description:
            axiosError.response?.data.message ?? 'Failed to fetch messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session?.user, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response.data.message,
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  if (!session || !session.user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh] text-amber-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const { username } = session.user as User;
  const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Link Copied!',
      description: 'Your secret message link is copied to clipboard.',
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-neutral-100 pt-24 pb-10 px-4 sm:px-6 lg:px-8 relative selection:bg-amber-400 selection:text-black">
      {/* Constant Top Navbar on Dashboard */}
      <Navbar className="!z-50" />

      {/* Torn Paper Realistic Background */}
      <TornPaperBackground />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Title & Top Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-serif drop-shadow-md">
              User Dashboard
            </h1>
            <p className="text-sm text-neutral-300 font-medium mt-1">
              Manage your anonymous feedback and personal link.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-[#141419]/90 backdrop-blur-md text-amber-300 px-4 py-2.5 rounded-2xl shadow-xl border border-amber-500/30">
            <span className="text-xs uppercase tracking-wider font-extrabold text-neutral-400">Status:</span>
            <Switch
              {...register('acceptMessages')}
              checked={!!acceptMessages}
              onCheckedChange={handleSwitchChange}
              disabled={isSwitchLoading}
            />
            <span className={`text-xs font-black ${acceptMessages ? 'text-amber-400' : 'text-neutral-500'}`}>
              {acceptMessages ? 'ACCEPTING' : 'MUTED'}
            </span>
          </div>
        </div>

        {/* Share Link Card */}
        <div className="rounded-2xl bg-[#0f0f14]/85 backdrop-blur-md text-white p-6 md:p-8 shadow-2xl space-y-3 border border-amber-500/30">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <LinkIcon className="w-4 h-4" />
            <span>Your Anonymous Link</span>
          </div>
          <p className="text-xs text-neutral-300">
            Share this link on your Instagram bio, WhatsApp, or Twitter to receive anonymous messages.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="flex-1 bg-black/80 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-amber-300 font-mono select-all overflow-hidden text-ellipsis">
              {profileUrl}
            </div>
            <Button
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black shadow-lg px-7 py-3 rounded-xl border-0 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Messages Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xl font-black text-white">
            <Inbox className="w-5 h-5 text-amber-400" />
            <span>Received Messages ({messages.length})</span>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
            }}
            className="bg-[#141419]/90 hover:bg-black text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl px-4 py-2 shadow-md transition"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
            ) : (
              <>
                <RefreshCcw className="h-3.5 w-3.5 mr-1.5 text-amber-400" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Messages 3D Interactive Stack Deck (One Deck at a time with Wheel / Button Scroll) */}
        <div className="pt-2">
          {messages.length > 0 ? (
            <div className="space-y-6">
              {/* Stack Controls & Navigation Pill */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-400">Card Deck:</span>
                  <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-black">
                    {activeCardIndex + 1} / {messages.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeCardIndex === 0 || isSwiping}
                    onClick={() => handleSwipe('prev')}
                    className="h-8 px-3 rounded-xl border-neutral-700 bg-[#141419]/90 text-neutral-200 hover:text-cyan-300 hover:border-cyan-400 transition"
                  >
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeCardIndex >= messages.length - 1 || isSwiping}
                    onClick={() => handleSwipe('next')}
                    className="h-8 px-3 rounded-xl border-neutral-700 bg-[#141419]/90 text-neutral-200 hover:text-cyan-300 hover:border-cyan-400 transition"
                  >
                    Next
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Interactive 3D Stack Stage with Smooth Physical Swipe Animation & Mobile Touch Support */}
              <div 
                onTouchStart={(e) => {
                  setTouchStartY(e.touches[0].clientY);
                }}
                onTouchEnd={(e) => {
                  if (touchStartY === null || isSwiping) return;
                  const touchEndY = e.changedTouches[0].clientY;
                  const deltaY = touchStartY - touchEndY;
                  if (deltaY > 40 && activeCardIndex < messages.length - 1) {
                    // Swiped up -> Next card
                    handleSwipe('next');
                  } else if (deltaY < -40 && activeCardIndex > 0) {
                    // Swiped down -> Previous card
                    handleSwipe('prev');
                  }
                  setTouchStartY(null);
                }}
                onWheel={(e) => {
                  if (isSwiping) return;
                  if (e.deltaY > 15 && activeCardIndex < messages.length - 1) {
                    handleSwipe('next');
                  } else if (e.deltaY < -15 && activeCardIndex > 0) {
                    handleSwipe('prev');
                  }
                }}
                className="relative py-4 sm:py-8 min-h-[520px] sm:min-h-[560px] flex items-center justify-center overflow-hidden cursor-ns-resize touch-pan-x"
              >
                <div
                  className={`w-full transition-all duration-300 ease-out transform ${
                    isSwiping
                      ? swipeDirection === 'next'
                        ? '-translate-y-28 rotate-[-9deg] opacity-0 scale-90'
                        : 'translate-y-28 rotate-[9deg] opacity-0 scale-90'
                      : 'translate-y-0 rotate-0 opacity-100 scale-100'
                  }`}
                >
                  <MessageCard
                    key={messages[activeCardIndex]._id.toString()}
                    message={messages[activeCardIndex]}
                    index={activeCardIndex}
                    total={messages.length}
                    onMessageDelete={handleDeleteMessage}
                  />
                </div>
              </div>

              {/* Scroll / Swipe Tip */}
              <p className="text-center text-[11px] font-bold text-neutral-400 uppercase tracking-widest px-4">
                💡 Swipe up/down on phone or scroll mouse wheel to flip through playing cards
              </p>
            </div>
          ) : (
            <div className="py-16 px-4 rounded-3xl bg-[#0f0f14]/85 backdrop-blur-md text-white border border-amber-500/20 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 mx-auto rounded-full bg-neutral-900 flex items-center justify-center text-amber-400">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-amber-400">No messages yet</h3>
              <p className="text-xs text-neutral-300 max-w-sm mx-auto">
                Share your unique link with friends to start getting secret feedback and confessions.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default UserDashboard;
