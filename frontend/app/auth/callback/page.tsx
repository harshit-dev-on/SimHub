"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, mapSupabaseUserToProfile, DEMO_USERS } from "@/lib/supabase";
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [statusText, setStatusText] = useState("Exchanging security tokens with Supabase...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDesc = searchParams.get("error_description");

        if (error || errorDesc) {
          throw new Error(errorDesc || error || "Authentication request failed");
        }

        if (code) {
          setStatusText("Exchanging PKCE authorization code in browser...");
          // Browser has the PKCE code_verifier stored in localStorage from signInWithOAuth
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("Supabase code exchange error:", exchangeError);
            throw exchangeError;
          }

          if (data?.session?.user) {
            const profile = mapSupabaseUserToProfile(data.session.user);
            let targetUrl = "/";
            if (typeof window !== "undefined") {
              localStorage.setItem("simhub_user", JSON.stringify(profile));
              const hasCustomized = localStorage.getItem("simhub_profile_customized");
              targetUrl = hasCustomized ? "/" : "/?firstTime=true";
            }

            if (isMounted) {
              setStatus("success");
              setStatusText(`Welcome, ${profile.name}! Redirecting to SimHub...`);
            }

            setTimeout(() => {
              window.location.href = targetUrl;
            }, 600);
            return;
          }
        }

        // If no code in query param, check if an existing session was detected via hash
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          if (typeof window !== "undefined") {
            localStorage.setItem("simhub_user", JSON.stringify(profile));
          }

          if (isMounted) {
            setStatus("success");
            setStatusText(`Welcome back, ${profile.name}!`);
          }

          setTimeout(() => {
            window.location.href = "/";
          }, 600);
          return;
        }

        // Fallback: If nothing was detected after a short pause, return home
        setTimeout(() => {
          window.location.href = "/";
        }, 1200);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        setStatus("error");
        setErrorMessage(msg);
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router]);

  const handleContinueAsDemo = () => {
    const demoUser = DEMO_USERS[0];
    let target = "/";
    if (typeof window !== "undefined") {
      localStorage.setItem("simhub_user", JSON.stringify(demoUser));
      const hasCustomized = localStorage.getItem("simhub_profile_customized");
      target = hasCustomized ? "/" : "/?firstTime=true";
    }
    window.location.href = target;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center space-y-4">
        {/* Brand Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/30">
          <span className="text-2xl font-black">▶</span>
        </div>

        <h2 className="text-xl font-bold text-white">SimHub Authentication</h2>

        {status === "processing" && (
          <div className="space-y-3 py-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-400" />
            <p className="text-sm text-slate-300 font-medium">{statusText}</p>
            <p className="text-xs text-slate-500">Completing secure OAuth handshake...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3 py-4">
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-400 animate-bounce" />
            <p className="text-sm text-emerald-300 font-medium">{statusText}</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 text-left space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Authentication Handshake Error</span>
              </div>
              <p className="break-words font-mono text-[11px]">{errorMessage}</p>
            </div>

            <p className="text-xs text-slate-400">
              The OAuth provider returned an error or is not enabled in your Supabase project settings.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleContinueAsDemo}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                <span>Continue into SimHub as Dr. Aris Thorne</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="w-full py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
