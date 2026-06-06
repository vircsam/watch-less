"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import SidebarComponent from "@/components/Sidebar";
import { Coins, Zap, Check, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function BillingPage() {
  useAuthRedirect();
  const { user, setCredits } = useAppStore();

  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const billingPlans = [
    {
      id: "starter",
      name: "Starter Pack",
      price: "$2",
      credits: 100,
      desc: "Great for individual research and quick projects.",
      features: [
        "10 full video analyses",
        "RAG video chat access",
        "PDF & Markdown exports",
        "Standard queue speed",
      ],
    },
    {
      id: "creator",
      name: "Creator Pack",
      price: "$9",
      credits: 500,
      desc: "Perfect for content creators and students.",
      features: [
        "50 full video analyses",
        "RAG video chat access",
        "PDF & Markdown exports",
        "Standard queue speed",
        "Bonus: 50 free credits included",
      ],
      popular: true,
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "$19",
      credits: 1200,
      desc: "Ideal for power users and teams.",
      features: [
        "120 full video analyses",
        "RAG video chat access",
        "PDF & Markdown exports",
        "Priority VPS queue speed",
        "Frame screenshot downloads",
        "Lifetime support",
      ],
    },
  ];

  const handlePurchase = async (planId: string, creditsAmount: number, planName: string) => {
    if (!user || purchasingPlan) return;

    setPurchasingPlan(planId);
    setSuccessMsg(null);
    setError(null);

    try {
      // Simulate gateway authorization
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await fetch("/api/billing/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          creditsToAdd: creditsAmount,
        }),
      });

      if (!res.ok) throw new Error("Payment gateway connection failed.");

      const data = await res.json();
      
      // Update local Zustand credits state
      setCredits(data.user.credits);
      
      setSuccessMsg(`Successfully credited ${creditsAmount} credits to your account for purchasing the ${planName}!`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Checkout failed. Please try again.");
    } finally {
      setPurchasingPlan(null);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-background min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <SidebarComponent />

      {/* Main Content Dashboard */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            <span>Billing &amp; AI Credits</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Acquire credit packs to power speech transcribing and detailed analysis pipelines.</p>
        </div>

        {/* Success / Error Banners */}
        {successMsg && (
          <div className="p-4 text-xs rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-400 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-xs rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Current Credit Widget */}
        <div className="rounded-2xl border border-white/5 bg-zinc-900/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-xl">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-zinc-300">Available Credits Balance</h2>
            <p className="text-xs text-zinc-500 leading-normal">
              Each video analysis costs 10 credits. RAG chat querying and searches are unlimited once analyzed.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 p-4 shrink-0 animate-pulse-slow">
            <Coins className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white leading-none">{user.credits}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mt-1">Credits</span>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Select a Credit Pack</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {billingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border bg-zinc-900/10 p-6 flex flex-col justify-between relative ${
                  plan.popular ? "border-primary shadow-xl shadow-primary/5 bg-zinc-900/20" : "border-white/5"
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                    Best Value
                  </span>
                )}

                <div>
                  <h4 className="text-sm font-bold text-white mb-1">{plan.name}</h4>
                  <p className="text-[11px] text-zinc-500 mb-4">{plan.desc}</p>
                  
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-zinc-500 text-xs font-semibold">one-time</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 border border-white/5 mb-6">
                    <Zap className="h-3 w-3 fill-primary text-primary" />
                    <span>{plan.credits} Credits</span>
                  </div>

                  <hr className="border-white/5 mb-4" />

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-xs text-zinc-300">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 pt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePurchase(plan.id, plan.credits, plan.name)}
                  disabled={purchasingPlan !== null}
                  className={`w-full text-center rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                    plan.popular
                      ? "bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/15"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  {purchasingPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Authorizing...</span>
                    </span>
                  ) : (
                    <span>Purchase Credits</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
