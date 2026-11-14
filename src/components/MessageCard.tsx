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
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
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
    // Outer Container with 3D Stacked-Card Illusion (Card on top of Card)
    <div className="relative group pt-2.5 pb-2 transition-all duration-300">
      
      {/* Underlying Stack Layer 2 (Bottom-most card tilt) */}
      <div 
        className="absolute inset-x-3 bottom-0 h-10 rounded-2xl bg-[#a66e0b] border-2 border-black opacity-40 transform translate-y-1.5 rotate-[-1.5deg] transition-transform duration-300 group-hover:translate-y-2 group-hover:rotate-[-2deg]" 
        aria-hidden="true" 
      />

      {/* Underlying Stack Layer 1 (Middle card layer) */}
      <div 
        className="absolute inset-x-1.5 bottom-1 h-12 rounded-2xl bg-[#c68913] border-2 border-black opacity-80 transform translate-y-1 rotate-[1deg] transition-transform duration-300 group-hover:translate-y-1.5 group-hover:rotate-[1.5deg]" 
        aria-hidden="true" 
      />

      {/* Main Top Card: Rich Luxury Golden Textured Card with Solid Thick Black Border */}
      <div className="relative z-10 rounded-2xl bg-gradient-to-br from-[#f5b82e] via-[#e5a51c] to-[#d49618] border-[2.5px] border-black p-6 md:p-7 shadow-[0_12px_30px_rgba(0,0,0,0.7)] group-hover:shadow-[0_18px_40px_rgba(229,165,28,0.3)] transition-all duration-300 group-hover:-translate-y-1">
        
        {/* Subtle Luxury Paper Texture Lines */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.06] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" 
          aria-hidden="true"
        />

        {/* Card Top Header */}
        <div className="relative flex justify-between items-start gap-4 pb-3 border-b-2 border-black/15">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-amber-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Anonymous Secret</span>
          </div>

          {/* Delete Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-black/70 hover:text-red-700 hover:bg-black/10 rounded-xl transition"
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
        <div className="relative my-4 min-h-[50px] flex items-center">
          <p className="text-lg md:text-xl font-extrabold text-black leading-snug break-words tracking-tight font-sans">
            "{message.content}"
          </p>
        </div>

        {/* Card Footer: Timestamp & Sparkle */}
        <div className="relative pt-3 border-t-2 border-black/15 flex items-center justify-between text-xs font-bold text-black/70">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-black/60" />
            <span>{dayjs(message.createdAt).format('MMM D, YYYY • h:mm A')}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-black/50">
            <Sparkles className="w-3 h-3 text-black/60" />
            <span>Delivered</span>
          </div>
        </div>

      </div>
    </div>
  );
}
