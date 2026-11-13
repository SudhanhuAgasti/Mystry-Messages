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
import { Loader2 } from 'lucide-react';

// Validation Schema
import { signUpSchema } from '@/schemas/signUpSchema';

export default function SignUpForm() {

  // Username state
  const [username, setUsername] = useState('');

  // Username availability message
  const [usernameMessage, setUsernameMessage] = useState('');

  // Username checking loader
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Form submit loader
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce username for API call
  const [debouncedUsername] = useDebounceValue(username, 300);

  // Router
  const router = useRouter();

  // React Hook Form
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  // Check username availability
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
            axiosError.response?.data.message ??
            'Error checking username'
          );

        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    checkUsernameUnique();

  }, [debouncedUsername]);

  // Form Submit
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {

    setIsSubmitting(true);

    try {

      // Sign Up API
      const response = await axios.post<ApiResponse>(
        '/api/sign-up',
        data
      );

      // Success Toast
      toast.success("Success", {
        description: response.data.message,
      });

      // Redirect to Verify Page
      router.replace(`/verify/${data.username}`);

      setIsSubmitting(false);

    } catch (error) {

      console.error('Error during sign-up:', error);

      const axiosError = error as AxiosError<ApiResponse>;

      const errorMessage =
        axiosError.response?.data?.message ??
        'There was a problem with your sign-up. Please try again.';

      // Error Toast
      toast.error("Sign Up Failed", {
        description: errorMessage,
      });

      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">

      {/* Main Card */}
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>

          <p className="mb-4">
            Sign up to start your anonymous adventure
          </p>
        </div>

        {/* React Hook Form */}
        <Form {...form}>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >

            {/* Username Field */}
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>

                  <FormLabel>Username</FormLabel>

                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setUsername(e.target.value);
                    }}
                  />

                  {/* Username Loader */}
                  {isCheckingUsername &&
                    <Loader2 className="animate-spin" />
                  }

                  {/* Username Status */}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}

                  <FormMessage />

                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>

                  <FormLabel>Email</FormLabel>

                  <Input
                    {...field}
                    name="email"
                  />

                  <p className="text-muted text-gray-400 text-sm">
                    We will send you a verification code
                  </p>

                  <FormMessage />

                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>

                  <FormLabel>Password</FormLabel>

                  <Input
                    type="password"
                    {...field}
                    name="password"
                  />

                  <FormMessage />

                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >

              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}

            </Button>

          </form>

        </Form>

        {/* Sign In Link */}
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link
              href="/sign-in"
              className="text-blue-600 hover:text-blue-800"
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}