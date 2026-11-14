'use client'

import React from 'react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { Trash2, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { Message } from '@/model/User';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/ApiResponse';

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
  index?: number;
  total?: number;
};

export function MessageCard({ message, onMessageDelete, index = 0, total = 1 }: MessageCardProps) {
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );
      toast({
        title: response.data.message,
      });
      onMessageDelete(message._id.toString());
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  return (
    // Outer Stack Container
    <div className="relative w-full max-w-xl mx-auto select-none">
      
      {/* Underlying Stack Layer 2 (Bottom-most subtle tilted card) */}
      <div 
        className="absolute inset-x-4 -bottom-3.5 h-14 rounded-3xl bg-[#98b6c8] border-2 border-black opacity-35 transform rotate-[-2.5deg] shadow-lg" 
        aria-hidden="true" 
      />

      {/* Underlying Stack Layer 1 (Middle tilted card) */}
      <div 
        className="absolute inset-x-2 -bottom-2 h-14 rounded-3xl bg-[#b7d0df] border-2 border-black opacity-70 transform rotate-[1.8deg] shadow-md" 
        aria-hidden="true" 
      />

      {/* Main Top Card: Elegant Creamy Ice Blue with Solid Black Border & Velvet Depth */}
      <div className="relative z-10 rounded-3xl bg-gradient-to-br from-[#eaf4fa] via-[#d6e8f4] to-[#c2ddee] border-[2.5px] border-black p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-300">
        
        {/* Subtle Frosted Paper Fiber Effect */}
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]" 
          aria-hidden="true"
        />

        {/* Card Header */}
        <div className="relative flex justify-between items-center pb-4 border-b-2 border-black/15">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-[#eaf4fa] text-xs font-black uppercase tracking-wider shadow-sm">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" />
              <span>Secret #{index + 1}</span>
            </div>
            {total > 1 && (
              <span className="text-[11px] font-bold text-black/60 uppercase tracking-widest">
                Card {index + 1} of {total}
              </span>
            )}
          </div>

          {/* Delete Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-black/70 hover:text-red-700 hover:bg-black/10 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#121215] border border-[#2a2412] text-neutral-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-amber-400 font-bold">
                  Delete this message?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-neutral-400">
                  This action cannot be undone. This secret message will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-[#1e1e24] text-neutral-200 border-neutral-700 hover:bg-neutral-800">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Secret Message Body */}
        <div className="relative my-6 min-h-[90px] flex items-center">
          <p className="text-xl md:text-2xl font-black text-black leading-snug break-words tracking-tight font-serif italic">
            "{message.content}"
          </p>
        </div>

        {/* Card Footer: Timestamp & Sparkle */}
        <div className="relative pt-4 border-t-2 border-black/15 flex items-center justify-between text-xs font-extrabold text-black/70">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-black/60" />
            <span>{dayjs(message.createdAt).format('MMM D, YYYY • h:mm A')}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-cyan-900">
            <Sparkles className="w-3.5 h-3.5 text-cyan-700 animate-pulse" />
            <span>Verified Anonymous</span>
          </div>
        </div>

      </div>
    </div>
  );
}
