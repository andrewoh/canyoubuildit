"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Lock, Plane, ShieldCheck, ArrowRight } from "lucide-react";
import "../globals.css";

function PaperSkyline() {
  return (
    <div className="paperSkyline loginSkyline" aria-hidden="true">
      <div className="cloud cloudOne" /><div className="cloud cloudTwo" /><div className="hill hillBack" /><div className="hill hillFront" /><div className="tower"><span /></div><div className="buildings">{Array.from({ length: 12 }).map((_, i) => <i key={i} />)}</div><div className="cherryTree"><span /></div>
    </div>
  );
}

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    setLoading(false);
    if (!res.ok) { setError("That password did not unlock the dashboard."); return; }
    router.push(searchParams.get("next") || "/");
    router.refresh();
  }

  return (
    <main className="loginPage">
      <header className="loginTop"><b>canyoubuildit.com</b><span><Lock size={14}/> Protected</span><p><i/> All transactions auto-categorized and synced live</p></header>
      <div className="loginBackdrop"><div className="blurCard left"/><div className="blurCard right"/><div className="blurChart"/></div>
      <section className="loginCard">
        <div className="lockMedallion"><Lock size={42}/></div>
        <PaperSkyline />
        <h1>Private Access</h1>
        <p>This is a private finance dashboard.<br/>Please enter your password to continue.</p>
        <form onSubmit={submit}>
          <label>Password</label>
          <div className="passwordBox"><Lock size={17}/><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" autoFocus/><Eye size={17}/></div>
          {error && <small className="loginError">{error}</small>}
          <button disabled={loading}>{loading ? "Unlocking…" : "Unlock Dashboard"} <ArrowRight size={18}/></button>
        </form>
        <span className="secureNote"><ShieldCheck size={16}/> Your data is encrypted and secure</span>
      </section>
      <section className="previewRail">
        <p>✣ A glimpse of what’s inside</p>
        <div className="previewCards">
          <article><Plane size={24}/><b>Flight to Seoul</b><span>SFO → ICN</span><em>Pending</em></article>
          <article><b>Amex Fine Hotels</b><span>Josun Palace, Seoul</span><strong>$4,347.40</strong></article>
          <article><b>CLEAR Plus</b><span>Travel services</span><strong>$209.00</strong></article>
          <article><b>Incheon Airport</b><span>Snack & Water</span><strong>$3.95</strong></article>
        </div>
        <small><i/> Auto-updating trip intelligence</small>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="loginPage" />}>
      <LoginForm />
    </Suspense>
  );
}
