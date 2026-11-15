'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signInSchema } from '@/schemas/signInSchema';
import { Crown, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const TornPaperBackground = dynamic(() => import('@/components/TornPaperBackground'), {
  ssr: false,
});

export default function SignInForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        setIsLoading(true);
        const result = await signIn('credentials', {
            redirect: false,
            identifier: data.identifier,
            password: data.password,
        });

        setIsLoading(false);

        if (result?.error) {
            if (result.error === 'CredentialsSignin') {
                toast.error("Login Failed", {
                    description: "Incorrect username/email or password",
                });
            } else {
                toast.error("Login Error", {
                    description: result.error,
                });
            }
            return;
        }

        if (result?.url || !result?.error) {
            toast.success("Welcome back!", {
                description: "Signed in successfully.",
            });
            router.replace('/dashboard');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#0b0b0e] px-4 py-12 relative overflow-hidden font-sans selection:bg-amber-400 selection:text-black">
            {/* Torn Paper Background */}
            <TornPaperBackground />

            <div className="w-full max-w-md p-8 space-y-7 bg-[#0f0f14]/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl shadow-2xl relative z-10">
                {/* Close / Cross Button to return Home */}
                <a
                    href="/"
                    aria-label="Close"
                    className="absolute top-5 right-5 p-2 rounded-full bg-[#181820] border border-amber-500/20 text-neutral-400 hover:text-white hover:border-amber-400 hover:bg-[#20202a] transition-all cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </a>

                {/* Crown Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/20 mb-2">
                        <Crown className="w-6 h-6 text-black" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                        Welcome Back
                    </h1>
                    <p className="text-xs text-neutral-400">
                        Sign in to access your royal feedback dashboard
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            name="identifier"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                        Email / Username
                                    </FormLabel>
                                    <div className="relative">
                                        <Input
                                            placeholder="Enter your email or username"
                                            className="bg-black/80 border-[#292212] focus-visible:ring-amber-500/50 text-neutral-100 placeholder:text-neutral-600 rounded-xl pl-4 py-2 text-sm"
                                            {...field}
                                        />
                                    </div>
                                    <FormMessage className="text-xs text-red-400" />
                                </FormItem>
                            )}
                        />

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
                                        placeholder="••••••••"
                                        className="bg-black/80 border-[#292212] focus-visible:ring-amber-500/50 text-neutral-100 placeholder:text-neutral-600 rounded-xl pl-4 py-2 text-sm"
                                        {...field}
                                    />
                                    <FormMessage className="text-xs text-red-400" />
                                </FormItem>
                            )}
                        />

                        <Button
                            className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-bold py-5 rounded-xl shadow-lg shadow-amber-500/10 border-0 mt-2 text-sm transition"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="text-center pt-2 border-t border-[#1f1b10]">
                    <p className="text-xs text-neutral-400">
                        Don't have an account?{' '}
                        <Link href="/sign-up" className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
