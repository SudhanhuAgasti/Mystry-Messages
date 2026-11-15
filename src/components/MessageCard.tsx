'use client'

import React from 'react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { Trash2, Clock, Sparkles, MessageSquareQuote } from 'lucide-react';
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
    // Vertical Playing Card Outer Frame
    <div className="relative w-full max-w-[320px] sm:max-w-[340px] md:max-w-[360px] mx-auto select-none my-1">
      
      {/* Main Playing Card: Clean Vertical Shape with Creamy Ice Blue & Solid Black Border */}
      <div className="relative z-10 w-full h-[400px] sm:h-[430px] md:h-[450px] rounded-[24px] bg-gradient-to-b from-[#f5faff] via-[#e2eef7] to-[#ccdfed] border-[3px] border-black p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-hidden">
        
        {/* Lined Notebook / Stationery Message Paper Texture Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.22] bg-[linear-gradient(to_bottom,transparent_27px,rgba(0,0,0,0.12)_28px)] [background-size:100%_28px]" 
          aria-hidden="true" 
        />

        {/* Vintage Paper Fiber Noise Texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]" 
          aria-hidden="true"
        />

        {/* Subtle Faint Message / Letter Stamp Watermark in Center Background */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none text-black"
          aria-hidden="true"
        >
          <MessageSquareQuote className="w-52 h-52 stroke-[1.2]" />
        </div>

        {/* Elegant Inset Border Line for Stationery Note Feel */}
        <div 
          className="absolute inset-2.5 rounded-[18px] border border-black/15 pointer-events-none" 
          aria-hidden="true" 
        />

        {/* --- CARD TOP SECTION --- */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Top-Left: Clean Minimal Card Index (#1, #2) */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black text-[#eaf4fa] text-xs font-black uppercase tracking-wider shadow-sm">
              #{index + 1}
            </span>
            {total > 1 && (
              <span className="text-[11px] font-extrabold text-black/60 uppercase tracking-widest">
                {index + 1} / {total}
              </span>
            )}
          </div>

          {/* Top-Right: Delete Action */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-black/70 hover:text-red-700 hover:bg-black/10 rounded-xl transition cursor-pointer"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#121215] border border-[#2a2412] text-neutral-100 max-w-[90vw] sm:max-w-lg">
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

        {/* --- CARD CENTER SECTION: The Secret Anonymous Message --- */}
        <div className="relative z-10 my-auto py-6 px-2 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-0.5 bg-black/25 mb-4 rounded-full" />
          <p className="text-lg sm:text-xl font-bold text-black leading-relaxed break-words tracking-tight font-serif italic max-h-[240px] overflow-y-auto pr-1">
            "{message.content}"
          </p>
          <div className="w-8 h-0.5 bg-black/25 mt-4 rounded-full" />
        </div>

        {/* --- CARD BOTTOM SECTION --- */}
        <div className="relative z-10 flex items-center justify-between pt-3 border-t border-black/15">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-black/70">
            <Clock className="w-3.5 h-3.5 text-black/60" />
            <span>{dayjs(message.createdAt).format('MMM D, YYYY • h:mm A')}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-cyan-900">
            <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
            <span>Anonymous</span>
          </div>
        </div>

      </div>
    </div>
  );
}
