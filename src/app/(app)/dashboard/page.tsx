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
      <div className="flex-1 flex items-center justify-center min-h-[70vh] text-black">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
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
    <div className="min-h-screen bg-gradient-to-b from-[#facc15] via-[#eab308] to-[#ca8a04] text-black py-10 px-4 sm:px-6 lg:px-8 selection:bg-black selection:text-yellow-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Title & Top Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-black/20">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-black font-serif">
              User Dashboard
            </h1>
            <p className="text-sm text-neutral-900 font-medium mt-1">
              Manage your anonymous feedback and personal link.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-black text-yellow-300 px-4 py-2.5 rounded-2xl shadow-lg border border-black">
            <span className="text-xs uppercase tracking-wider font-extrabold text-neutral-300">Status:</span>
            <Switch
              {...register('acceptMessages')}
              checked={!!acceptMessages}
              onCheckedChange={handleSwitchChange}
              disabled={isSwitchLoading}
            />
            <span className={`text-xs font-black ${acceptMessages ? 'text-yellow-400' : 'text-neutral-500'}`}>
              {acceptMessages ? 'ACCEPTING' : 'MUTED'}
            </span>
          </div>
        </div>

        {/* Share Link Card */}
        <div className="rounded-2xl bg-black text-white p-6 md:p-8 shadow-2xl space-y-3 border border-black">
          <div className="flex items-center gap-2 text-sm font-bold text-yellow-400">
            <LinkIcon className="w-4 h-4" />
            <span>Your Anonymous Link</span>
          </div>
          <p className="text-xs text-neutral-300">
            Share this link on your Instagram bio, WhatsApp, or Twitter to receive anonymous messages.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-yellow-300 font-mono select-all overflow-hidden text-ellipsis">
              {profileUrl}
            </div>
            <Button
              onClick={copyToClipboard}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black shadow-lg px-7 py-3 rounded-xl border-0 transition"
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
          <div className="flex items-center gap-2 text-xl font-black text-black">
            <Inbox className="w-5 h-5 text-black" />
            <span>Received Messages ({messages.length})</span>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
            }}
            className="bg-black hover:bg-neutral-800 text-yellow-400 font-bold text-xs rounded-xl px-4 py-2 shadow-md border-0"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-400" />
            ) : (
              <>
                <RefreshCcw className="h-3.5 w-3.5 mr-1.5 text-yellow-400" />
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
            <div className="col-span-full py-16 px-4 rounded-2xl bg-black/90 text-white border border-black text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 mx-auto rounded-full bg-neutral-900 flex items-center justify-center text-yellow-400">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-yellow-400">No messages yet</h3>
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
