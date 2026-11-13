'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { Mail, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';

const sampleMessages = [
  {
    title: 'Secret Admirer',
    content: "Hey, really love your positive vibe! Keep shining.",
    received: '10 minutes ago',
  },
  {
    title: 'Anonymous Feedback',
    content: "Your recent presentation was truly inspiring and well-structured.",
    received: '2 hours ago',
  },
  {
    title: 'Curious Friend',
    content: "What's the one skill you want to master this year?",
    received: '1 day ago',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-24 py-12 text-center">
        <section className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-gray-800 text-gray-300 border border-gray-700">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            100% Anonymous & Secure Messaging
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Dive into the World of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-400">
              Anonymous Feedback
            </span>
          </h1>

          <p className="mt-3 md:mt-4 text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
            True Feedback allows you to receive candid, honest, and anonymous messages from your friends, colleagues, and audience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/sign-up">
              <Button className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg font-semibold shadow-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-gray-700 bg-gray-800 text-white hover:bg-gray-700 px-8 py-6 text-lg font-semibold"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Cards / Showcase */}
        <section className="mt-16 w-full max-w-5xl">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-300 flex items-center justify-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            See what people receive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {sampleMessages.map((msg, index) => (
              <Card
                key={index}
                className="bg-gray-800/80 border-gray-700 text-white hover:border-gray-600 transition shadow-md"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-teal-300">
                    <Mail className="w-4 h-4" />
                    {msg.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-200 min-h-[48px]">{msg.content}</p>
                  <p className="text-xs text-gray-400 mt-4">{msg.received}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Privacy Highlight */}
        <section className="mt-16 py-6 px-8 rounded-2xl bg-gray-800/40 border border-gray-800 max-w-2xl flex items-center gap-4 text-left">
          <ShieldCheck className="w-10 h-10 text-emerald-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white">Your Identity is Protected</h3>
            <p className="text-sm text-gray-400">
              Only you can see your received messages. Senders are completely anonymous.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center p-6 bg-gray-950 text-gray-400 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} True Feedback. All rights reserved.
      </footer>
    </div>
  );
}
