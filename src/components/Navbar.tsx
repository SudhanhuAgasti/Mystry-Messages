'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { Crown, LogOut, User as UserIcon } from 'lucide-react';

function Navbar() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0d]/90 border-b border-[#2b2512]/60 px-4 md:px-8 py-3.5 transition-all">
            <div className="container mx-auto flex flex-row justify-between items-center">
                {/* Logo with Royal Crown */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                        <Crown className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-sans">
                        True Feedback
                    </span>
                </Link>

                {session && user ? (
                    <div className="flex items-center space-x-3 md:space-x-5">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181611] border border-[#3b3218] text-xs font-medium text-amber-200">
                            <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span>@{user.username || user.email}</span>
                        </div>

                        <Button 
                            onClick={() => signOut({ callbackUrl: '/sign-in' })} 
                            className="bg-[#181611] hover:bg-red-950/40 text-neutral-200 hover:text-red-300 border border-[#382f16] hover:border-red-900/60 text-xs md:text-sm font-medium transition"
                            variant="outline"
                            size="sm"
                        >
                            <LogOut className="w-3.5 h-3.5 mr-1.5" />
                            Logout
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link href="/sign-in">
                            <Button 
                                className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-semibold text-xs md:text-sm shadow-md shadow-amber-500/20 border-0"
                                size="sm"
                            >
                                Login
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
