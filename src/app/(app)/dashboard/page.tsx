'use client';

import dynamic from 'next/dynamic';
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
import Navbar from '@/components/Navbar';

// Production Dynamic Lazy Loading for Background & Message Card
const TornPaperBackground = dynamic(() => import('@/components/TornPaperBackground'), {
  ssr: false,
});

const MessageCard = dynamic(
  () => import('@/components/MessageCard').then((mod) => mod.MessageCard),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[310px] h-[370px] rounded-[22px] bg-[#bbdefb]/20 border-2 border-black/30 flex items-center justify-center animate-pulse mx-auto">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    ),
  }
);

const EmptyStateCard = dynamic(
  () => import('@/components/EmptyStateCard').then((mod) => mod.EmptyStateCard),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[310px] h-[370px] rounded-[22px] bg-[#bbdefb]/20 border-2 border-black/30 flex items-center justify-center animate-pulse mx-auto">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    ),
  }
);

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

  const totalCards = messages.length > 0 ? messages.length + 1 : 0;
  const isViewingEndCard = messages.length > 0 && activeCardIndex === messages.length;

  const handleSwipe = useCallback((direction: 'next' | 'prev') => {
    if (isSwiping) return;
    if (direction === 'next' && activeCardIndex < totalCards - 1) {
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
  }, [activeCardIndex, totalCards, isSwiping]);

  // Auto-scroll every 10 seconds if user is idle and messages exist
  useEffect(() => {
    if (messages.length <= 1) return;

    const timer = setInterval(() => {
      if (isSwiping) return;
      setActiveCardIndex((prevIndex) => {
        setSwipeDirection('next');
        setIsSwiping(true);
        setTimeout(() => {
          setIsSwiping(false);
        }, 320);
        return (prevIndex + 1) % messages.length;
      });
    }, 10000);

    return () => clearInterval(timer);
  }, [messages.length, activeCardIndex, isSwiping]);

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
        const fetchedMessages = response.data.messages || [];
        setMessages(fetchedMessages);
        setActiveCardIndex((prev) => {
          if (fetchedMessages.length === 0) return 0;
          return prev >= fetchedMessages.length ? 0 : prev;
        });
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
    <div className="min-h-screen md:h-screen md:max-h-screen bg-[#0b0b0e] text-neutral-100 pt-16 pb-4 md:pb-2 px-3 sm:px-6 relative selection:bg-amber-400 selection:text-black flex flex-col overflow-y-auto md:overflow-hidden">
      {/* Constant Top Navbar on Dashboard */}
      <Navbar className="!z-50" />

      {/* Torn Paper Realistic Background */}
      <TornPaperBackground />

      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-between py-2 sm:py-3 relative z-10 min-h-0">

        {/* Compact Header: Title + Status Switch in One Line */}
        <header className="flex items-center justify-between gap-2 pb-2 border-b border-amber-500/20 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white font-serif drop-shadow-md">
              User Dashboard
            </h1>
            <p className="text-[11px] sm:text-xs text-neutral-400 font-medium hidden sm:block">
              Manage your anonymous feedback and personal link.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-[#141419]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg border border-amber-500/30 shrink-0">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">
              Status:
            </span>
            <Switch
              {...register('acceptMessages')}
              checked={!!acceptMessages}
              onCheckedChange={handleSwitchChange}
              disabled={isSwitchLoading}
              className="scale-90 data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-300 [&>span]:bg-black"
            />
            <span className="text-[11px] font-black text-amber-400 tracking-wider">
              {acceptMessages ? 'ACCEPTING' : 'MUTED'}
            </span>
          </div>
        </header>

        {/* Compact Share Link Bar */}
        <section className="rounded-xl bg-[#0f0f14]/85 backdrop-blur-md text-white p-2.5 sm:p-3 shadow-lg border border-amber-500/25 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 shrink-0">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Secret Link:</span>
            </div>
            <div className="flex-1 bg-black/80 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono select-all truncate">
              {profileUrl}
            </div>
            <Button
              onClick={copyToClipboard}
              size="sm"
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black shadow px-4 py-1.5 h-8 text-xs rounded-lg border-0 transition shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Messages Header Bar */}
        <div className="flex items-center justify-between shrink-0 pt-0.5 px-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-white">
            <Inbox className="w-4 h-4 text-amber-400" />
            <span>Received Messages ({messages.length})</span>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
            }}
            className="h-7 bg-[#141419]/90 hover:bg-black text-amber-400 border border-amber-500/30 font-bold text-[11px] rounded-lg px-2.5 py-1 shadow-sm transition"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
            ) : (
              <>
                <RefreshCcw className="h-3 w-3 mr-1 text-amber-400" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Messages Presentation Stage (Fit in Viewport) */}
        <main className="flex-1 min-h-0 flex flex-col justify-center">
          {messages.length > 0 ? (
            <div className="flex flex-col h-full justify-between py-1">
              {/* Card Navigation Controls */}
              <div className="flex items-center justify-between px-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[10px] text-neutral-400 font-medium">
                    (Auto-slides 10s)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeCardIndex === 0 || isSwiping}
                    onClick={() => handleSwipe('prev')}
                    className="h-7 px-2.5 text-xs rounded-lg border-neutral-700 bg-[#141419]/90 text-neutral-200 hover:text-cyan-300 hover:border-cyan-400 transition"
                  >
                    <ChevronUp className="w-3.5 h-3.5 mr-0.5" />
                    Prev
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={activeCardIndex >= totalCards - 1 || isSwiping}
                    onClick={() => handleSwipe('next')}
                    className="h-7 px-2.5 text-xs rounded-lg border-neutral-700 bg-[#141419]/90 text-neutral-200 hover:text-cyan-300 hover:border-cyan-400 transition"
                  >
                    Next
                    <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>

              {/* Interactive 3D Card Stage with Mobile Touch & Wheel Support */}
              <div
                onTouchStart={(e) => {
                  setTouchStartY(e.touches[0].clientY);
                }}
                onTouchEnd={(e) => {
                  if (touchStartY === null || isSwiping) return;
                  const touchEndY = e.changedTouches[0].clientY;
                  const deltaY = touchStartY - touchEndY;
                  if (deltaY > 40 && activeCardIndex < totalCards - 1) {
                    handleSwipe('next');
                  } else if (deltaY < -40 && activeCardIndex > 0) {
                    handleSwipe('prev');
                  }
                  setTouchStartY(null);
                }}
                onWheel={(e) => {
                  if (isSwiping) return;
                  if (e.deltaY > 15 && activeCardIndex < totalCards - 1) {
                    handleSwipe('next');
                  } else if (e.deltaY < -15 && activeCardIndex > 0) {
                    handleSwipe('prev');
                  }
                }}
                className="flex-1 min-h-0 flex items-center justify-center overflow-hidden cursor-ns-resize touch-pan-x py-1"
              >
                <div
                  className={`w-full transition-all duration-300 ease-out transform ${isSwiping
                      ? swipeDirection === 'next'
                        ? '-translate-y-20 rotate-[-8deg] opacity-0 scale-90'
                        : 'translate-y-20 rotate-[8deg] opacity-0 scale-90'
                      : 'translate-y-0 rotate-0 opacity-100 scale-100'
                    }`}
                >
                  {isViewingEndCard ? (
                    <EmptyStateCard
                      onRefresh={() => {
                        setActiveCardIndex(0);
                        fetchMessages();
                      }}
                      isLoading={isLoading}
                      onCopyLink={copyToClipboard}
                      isEndState={true}
                    />
                  ) : (
                    <MessageCard
                      key={messages[activeCardIndex]._id?.toString() || `msg-${activeCardIndex}`}
                      message={messages[activeCardIndex]}
                      index={activeCardIndex}
                      total={messages.length}
                      onMessageDelete={handleDeleteMessage}
                    />
                  )}
                </div>
              </div>

              {/* Scroll / Swipe Tip */}
              <p className="text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2 shrink-0">
                💡 Swipe up/down on phone or scroll mouse wheel (10s auto-flip)
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex items-center justify-center py-2">
              <EmptyStateCard
                onRefresh={fetchMessages}
                isLoading={isLoading}
                onCopyLink={copyToClipboard}
                isEndState={false}
              />
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default UserDashboard;
