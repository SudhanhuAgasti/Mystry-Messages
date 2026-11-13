'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { verifySchema } from '@/schemas/verifySchema';
import { Crown, KeyRound, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function VerifyAccount() {
    const router = useRouter();
    const params = useParams<{ username: string }>();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        setIsLoading(true);
        try {
            const response = await axios.post<ApiResponse>(`/api/verify-code`, {
                username: params.username,
                code: data.code,
            });

            toast.success("Account Verified!", {
                description: response.data.message || 'You can now sign in.',
            });

            router.replace('/sign-in');
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error("Verification Failed", {
                description: axiosError.response?.data.message ?? 'An error occurred. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#070709] px-4 py-12 relative overflow-hidden font-sans">
            {/* Ambient Gold Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />

            <div className="w-full max-w-md p-8 space-y-7 bg-[#0f0f13] border border-[#2d2512] rounded-2xl shadow-2xl relative z-10">
                {/* Crown Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/20 mb-2">
                        <KeyRound className="w-6 h-6 text-black" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                        Verify Account
                    </h1>
                    <p className="text-xs text-neutral-400">
                        Enter the 6-digit code for <span className="text-amber-400 font-semibold">@{params.username}</span>
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            name="code"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                        6-Digit Verification Code
                                    </FormLabel>
                                    <Input
                                        placeholder="123456"
                                        maxLength={6}
                                        className="bg-[#09090c] border-[#292212] focus-visible:ring-amber-500/50 text-neutral-100 placeholder:text-neutral-600 rounded-xl text-center text-xl tracking-[0.3em] font-mono py-3"
                                        {...field}
                                    />
                                    <FormMessage className="text-xs text-red-400" />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-bold py-5 rounded-xl shadow-lg shadow-amber-500/10 border-0 text-sm transition"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify & Proceed <ArrowRight className="w-4 h-4 ml-1.5" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
