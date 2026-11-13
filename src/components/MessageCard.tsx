'use client'

import React from 'react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { Trash2, ShieldQuestion, Clock } from 'lucide-react';
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
      });
    }
  };

  return (
    <div className="relative group rounded-2xl bg-gradient-to-b from-[#141417] to-[#0d0d10] border border-[#2b2512] hover:border-[#eab308]/60 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
      {/* Golden accent bar on left */}
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 rounded-r-full" />

      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <ShieldQuestion className="w-4 h-4 text-amber-400" />
          <span>Anonymous Feedback</span>
        </div>

        {/* Delete Dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
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

      {/* Message Content */}
      <div className="my-4">
        <p className="text-base md:text-lg text-neutral-100 font-medium leading-relaxed break-words">
          "{message.content}"
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-1.5 text-xs text-neutral-500 pt-2 border-t border-[#221e14]">
        <Clock className="w-3.5 h-3.5 text-amber-500/70" />
        <span>{dayjs(message.createdAt).format('MMM D, YYYY • h:mm A')}</span>
      </div>
    </div>
  );
}
