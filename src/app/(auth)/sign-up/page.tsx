'use client';

// API response type
import { ApiResponse } from '@/types/ApiResponse';

// React Hook Form + Zod validation
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Next.js
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// React Hooks
import { useEffect, useState } from 'react';

// Debounce hook
import { useDebounceValue } from "usehooks-ts";

// UI Components
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Toast Notification
import { toast } from 'sonner';

// API Calls
import axios, { AxiosError } from 'axios';

// Icons
import { Loader2, Crown, CheckCircle2, ArrowRight } from 'lucide-react';

// Validation Schema
import { signUpSchema } from '@/schemas/signUpSchema';

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [debouncedUsername] = useDebounceValue(username, 300);
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true);
        setUsernameMessage('');

        try {
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${debouncedUsername}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data?.message ?? 'Error checking username'
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    checkUsernameUnique();
  }, [debouncedUsername]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data);
      toast.success("Success", {
        description: response.data.message,
      });

      router.replace(`/verify/${data.username}`);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error during sign-up:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data?.message ??
        'There was a problem with your sign-up. Please try again.';

      toast.error("Sign Up Failed", {
        description: errorMessage,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#070709] px-4 py-12 relative overflow-hidden font-sans">
      {/* Ambient Gold Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[350px] bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md p-8 space-y-7 bg-[#0f0f13] border border-[#2d2512] rounded-2xl shadow-2xl relative z-10">
        {/* Crown Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/20 mb-2">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            Join True Feedback
          </h1>
          <p className="text-xs text-neutral-400">
            Create your account & unlock your secret feedback link
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Field */}
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Username
                  </FormLabel>
                  <div className="relative">
                    <Input
                      placeholder="e.g. rahul_roy"
                      className="bg-[#09090c] border-[#292212] focus-visible:ring-amber-500/50 text-neutral-100 placeholder:text-neutral-600 rounded-xl pr-10 pl-4 py-2 text-sm"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setUsername(e.target.value);
                      }}
                    />
                    {isCheckingUsername && (
                      <Loader2 className="animate-spin w-4 h-4 text-amber-400 absolute right-3 top-3" />
                    )}
                  </div>

                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-xs mt-1 ${
                        usernameMessage === 'Username is unique'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Email Address
                  </FormLabel>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="bg-[#09090c] border-[#292212] focus-visible:ring-amber-500/50 text-neutral-100 placeholder:text-neutral-600 rounded-xl pl-4 py-2 text-sm"
                    {...field}
                  />
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    className="bg-[#09090c] border-[#292212] focus-visible:ring-amber-500/50 text-neutral-100 placeholder:text-neutral-600 rounded-xl pl-4 py-2 text-sm"
                    {...field}
                  />
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-bold py-5 rounded-xl shadow-lg shadow-amber-500/10 border-0 mt-2 text-sm transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center pt-2 border-t border-[#1f1b10]">
          <p className="text-xs text-neutral-400">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
