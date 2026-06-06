"use client";

import React from "react";
import Link from "next/link";
import { 
  Video, 
  Cpu, 
  MessageSquare, 
  Clock, 
  Search, 
  FileDown, 
  ArrowRight, 
  Zap, 
  Check, 
  HelpCircle,
  PlayCircle
} from "lucide-react";
import { useAppStore } from "@/store";

export default function LandingPage() {
  const { isAuthenticated } = useAppStore();

  const features = [
    {
      title: "AI Video Summaries",
      desc: "Get 3-5 paragraph executive summaries and detailed chapter-by-chapter breakdowns in seconds.",
      icon: Cpu,
    },
    {
      title: "RAG-Based AI Chat",
      desc: "Ask the AI assistant anything about pricing, tools, or specific facts mentioned in the video transcript.",
      icon: MessageSquare,
    },
    {
      title: "Interactive Timelines",
      desc: "Browse a milestone-based timeline of important events with embedded frame screenshots and insights.",
      icon: Clock,
    },
    {
      title: "Search Inside Video",
      desc: "Search transcript speech segments for key phrases and click timestamps to seek the player automatically.",
      icon: Search,
    },
    {
      title: "Resource & Link Extraction",
      desc: "Automatically extracts all spoken and visual URLs, GitHub repos, and links mentioned in the video.",
      icon: Zap,
    },
    {
      title: "High Fidelity Export",
      desc: "Download reports in PDF, Markdown, CSV, or raw JSON formats with all summaries and keyframes.",
      icon: FileDown,
    },
  ];

  const pricingTiers = [
    {
      name: "Free Trial",
      price: "$0",
      credits: "50 Credits",
      desc: "Test Viddy's AI analysis capabilities.",
      features: [
        "Analyze up to 5 standard videos",
        "Full transcript generation",
        "RAG video chat access",
        "Markdown & JSON report exports",
        "Community support",
      ],
      cta: "Sign Up Free",
      href: "/signup",
      popular: false,
    },
    {
      name: "Professional",
      price: "$19",
      period: "/month",
      credits: "1,000 Credits/mo",
      desc: "Ideal for researchers, creators, and students.",
      features: [
        "Everything in Free Trial",
        "Bulk video queues",
        "PDF & CSV advanced exports",
        "Fast VPS priority queues",
        "Full frame screenshot extraction",
        "Priority email support",
      ],
      cta: "Get Pro Now",
      href: "/signup",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      credits: "Unlimited",
      desc: "Deploy custom LLM models in your virtual private cloud.",
      features: [
        "Dedicated VPS endpoints",
        "Custom fine-tuned Ollama models",
        "Active directory single sign-on",
        "99.9% uptime SLA service",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
      href: "mailto:sales@viddy.ai",
      popular: false,
    },
  ];

  const faqs = [
    {
      q: "How does the AI video analysis work?",
      a: "Viddy downloads the audio stream of your uploaded video or YouTube URL. It feeds the audio into faster-whisper on our VPS, generating an accurate text transcript. Finally, our local Ollama Llama 3 model processes the text to create structured summaries, chapters, timeline insights, and flowcharts.",
    },
    {
      q: "What video formats do you support?",
      a: "We support direct video file uploads in MP4, MOV, MKV, and WEBM formats up to 200MB. You can also paste any public YouTube URL or direct link for instant processing.",
    },
    {
      q: "Can I jump to specific sections of a video?",
      a: "Yes! Viddy maps all transcripts, chapters, and RAG chat replies to exact timestamps. Clicking any timestamp will automatically seek the video player to that exact second.",
    },
    {
      q: "How does the credit system work?",
      a: "Analyzing a standard video consumes 10 credits. Free accounts receive 50 complimentary credits upon signup, allowing you to analyze 5 videos. You can purchase additional credits under the Billing panel.",
    },
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 bg-glow-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Tagline */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 mb-6 animate-fade-in">
            <Zap className="h-3 w-3 fill-primary" />
            <span>Understand Every Video Instantly</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.15]">
            Supercharge Your Learning with <span className="text-gradient-primary">Viddy AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload videos or paste YouTube URLs to automatically transcribe, summarize, extract keyframes, and query content through an interactive RAG assistant.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={isAuthenticated ? "/dashboard" : "/signup"}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-200 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-6 py-3 text-base font-semibold text-white transition-all duration-200"
            >
              <PlayCircle className="h-4.5 w-4.5 text-zinc-400" />
              <span>Watch Demo</span>
            </a>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section id="demo" className="py-12 bg-zinc-950/40 border-t border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/8 glass-panel overflow-hidden p-3 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />
            <img 
              src="https://picsum.photos/seed/viddydemo/1200/675" 
              alt="Viddy Application Interface Mockup"
              className="w-full rounded-xl object-cover border border-white/5 shadow-inner"
            />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-zinc-500 block mb-2">Platform Preview</span>
              <h3 className="text-lg font-bold text-white mb-4">Interactive AI Workspace Dashboard</h3>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-100 px-4.5 py-2 text-sm font-bold shadow-md transition-colors"
              >
                <span>Try Demo Simulator</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Everything you need to analyze video at scale
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
              A comprehensive toolkit for transcribing lectures, summarizing technical talks, and querying media archives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-white/5 bg-zinc-900/10 p-6 glass-panel-hover"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary mb-5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-wide">{feat.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-24 bg-zinc-950/20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-primary block mb-2">Workflow</span>
            <h2 className="text-3xl font-bold tracking-tight text-white">How Viddy Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-extrabold text-lg group-hover:border-primary group-hover:text-primary transition-all duration-200 mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Paste Video Link</h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Upload your local video file (MP4, MKV) or paste a YouTube URL directly into Viddy.
              </p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-extrabold text-lg group-hover:border-secondary group-hover:text-secondary transition-all duration-200 mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">VPS AI Processing</h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Our FastAPI VPS transcribes the spoken content using Whisper and extracts structure using Llama 3.
              </p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-extrabold text-lg group-hover:border-accent group-hover:text-accent transition-all duration-200 mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Interact & Export</h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
                Browse the interactive timeline, query details in the chat room, and download PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section id="pricing" className="py-20 md:py-28 bg-background border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Flexible Plans for Every User
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
              No credit card required to start. Earn credits and analyze your first videos for free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx}
                className={`rounded-2xl border bg-zinc-900/10 p-8 flex flex-col justify-between relative ${
                  tier.popular 
                    ? "border-primary shadow-xl shadow-primary/5 bg-zinc-900/30" 
                    : "border-white/5"
                }`}
              >
                {tier.popular && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-xs text-zinc-500 mb-6">{tier.desc}</p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold tracking-tight text-white">{tier.price}</span>
                    {tier.period && <span className="text-zinc-400 text-sm">{tier.period}</span>}
                  </div>

                  <div className="flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 border border-white/5 mb-8 w-fit">
                    <Zap className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span>{tier.credits}</span>
                  </div>

                  <hr className="border-white/5 mb-6" />

                  <ul className="space-y-3.5 mb-8">
                    {tier.features.map((feat, fidx) => (
                      <li key={fidx} className="flex gap-2.5 items-start text-sm text-zinc-300">
                        <Check className="h-4.5 w-4.5 text-primary shrink-0 pt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={tier.href}
                  className={`w-full text-center rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    tier.popular
                      ? "bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/10"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faq" className="py-20 md:py-24 bg-zinc-950/20 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-zinc-400 text-sm">Have any queries? We are here to clarify them.</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl border border-white/5 bg-zinc-900/10 p-6"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-white mb-2 tracking-wide">{faq.q}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 md:py-20 bg-zinc-950 border-t border-white/5 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-4">
            Start understanding video content today
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mb-8">
            Create an account in less than a minute and unlock 50 free credits to test our speech transcribing pipelines.
          </p>
          <Link
            href="/signup"
            className="rounded-lg bg-primary hover:bg-primary/95 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all duration-200"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-zinc-950 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            <span className="font-bold text-zinc-300">Viddy SaaS</span>
            <span>&copy; {new Date().getFullYear()} Viddy Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
