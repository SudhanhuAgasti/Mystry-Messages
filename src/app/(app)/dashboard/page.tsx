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
import { Loader2, RefreshCcw, Copy, Check, Link as LinkIcon, Inbox } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import TornPaperBackground from '@/components/TornPaperBackground';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message._id.toString() !== messageId)
    );
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

        {/* Messages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard
                key={message._id.toString()}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <div className="col-span-full py-16 px-4 rounded-2xl bg-[#0f0f14]/85 backdrop-blur-md text-white border border-amber-500/20 text-center space-y-3 shadow-xl">
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
