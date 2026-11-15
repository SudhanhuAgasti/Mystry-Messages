'use client'

import React from 'react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { Trash2, Clock, Sparkles, Crown } from 'lucide-react';
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

// Map card indices to classic playing card ranks (A, 2, 3... 10, J, Q, K)
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];

export function MessageCard({ message, onMessageDelete, index = 0, total = 1 }: MessageCardProps) {
  const { toast } = useToast();

  const rank = RANKS[index % RANKS.length];
  const suit = SUITS[index % SUITS.length];
  const isRedSuit = suit === '♥' || suit === '♦';

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
    // Outer Playing Card Deck Container (Tall Vertical Playing Card Proportions)
    <div className="relative w-full max-w-[320px] sm:max-w-[350px] mx-auto select-none my-2">
      
      {/* Underlying Stack Layer 2 (Bottom-most tilted physical card) */}
      <div 
        className="absolute inset-0 rounded-[26px] bg-[#9cbacd] border-[2.5px] border-black opacity-45 transform rotate-[-3.5deg] translate-y-3.5 shadow-2xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Underlying Stack Layer 1 (Middle tilted physical card) */}
      <div 
        className="absolute inset-0 rounded-[26px] bg-[#bdd3e1] border-[2.5px] border-black opacity-75 transform rotate-[2.8deg] translate-y-2 shadow-xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Main Top Playing Card: Vertical Tarot/Poker Proportions with Creamy Ice Blue & Solid Black Border */}
      <div className="relative z-10 w-full min-h-[480px] sm:min-h-[510px] rounded-[26px] bg-gradient-to-b from-[#f2f8fc] via-[#dcedf7] to-[#c5dfef] border-[3px] border-black p-5 sm:p-6 shadow-[0_22px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-hidden">
        
        {/* Playing Card Inner Framed Inset Border */}
        <div 
          className="absolute inset-2.5 rounded-[18px] border border-black/20 pointer-events-none" 
          aria-hidden="true" 
        />

        {/* Vintage Playing Card Texture / Subtle Micro-Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" 
          aria-hidden="true"
        />

        {/* Watermark Crown / Playing Card Center Seal in background */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.045] select-none text-black"
          aria-hidden="true"
        >
          <Crown className="w-56 h-56 stroke-[1]" />
        </div>

        {/* --- CARD TOP SECTION --- */}
        <div className="relative z-10 flex items-start justify-between">
          {/* Top-Left Playing Card Index (Rank + Suit + Card Counter) */}
          <div className="flex flex-col items-center leading-none select-none">
            <span className="text-2xl sm:text-3xl font-black font-serif text-black tracking-tight">
              {rank}
            </span>
            <span className={`text-xl sm:text-2xl font-bold leading-none ${isRedSuit ? 'text-red-700' : 'text-black'}`}>
              {suit}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-black/50 mt-1">
              #{index + 1}
            </span>
          </div>

          {/* Top Center: Deck Counter Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-[#eaf4fa] text-[11px] font-black uppercase tracking-wider shadow-sm mt-0.5">
            <Sparkles className="w-3 h-3 text-cyan-300 fill-cyan-300" />
            <span>Card {index + 1} of {total}</span>
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

        {/* --- CARD CENTER SECTION: The Anonymous Secret Message --- */}
        <div className="relative z-10 my-auto py-6 px-2 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-0.5 bg-black/25 mb-4 rounded-full" />
          <p className="text-lg sm:text-xl font-bold text-black leading-relaxed break-words tracking-tight font-serif italic max-h-[220px] overflow-y-auto pr-1">
            "{message.content}"
          </p>
          <div className="w-8 h-0.5 bg-black/25 mt-4 rounded-full" />
        </div>

        {/* --- CARD BOTTOM SECTION --- */}
        <div className="relative z-10 flex items-end justify-between pt-3 border-t border-black/15">
          {/* Bottom Left: Time & Anonymous Badge */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-black/70">
              <Clock className="w-3 h-3 text-black/60" />
              <span>{dayjs(message.createdAt).format('MMM D, YYYY')}</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-900">
              Anonymous Message
            </div>
          </div>

          {/* Bottom-Right Inverted Playing Card Index (Classic 180° rotation) */}
          <div className="flex flex-col items-center leading-none select-none rotate-180">
            <span className="text-2xl sm:text-3xl font-black font-serif text-black tracking-tight">
              {rank}
            </span>
            <span className={`text-xl sm:text-2xl font-bold leading-none ${isRedSuit ? 'text-red-700' : 'text-black'}`}>
              {suit}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-black/50 mt-1">
              #{index + 1}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
