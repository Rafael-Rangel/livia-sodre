"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { brand } from "@/data/content";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Senha incorreta");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="texture flex min-h-screen items-center justify-center px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md border border-[var(--line)] bg-white/50 p-8 shadow-[var(--shadow)]"
      >
        <p className="display text-center text-3xl tracking-[0.15em] text-[var(--gold)]">
          {brand.monogram}
        </p>
        <h1 className="display mt-4 text-center text-3xl text-[var(--chocolate)]">
          Área da clínica
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--muted)]">
          Acesso rápido ao dashboard premium
        </p>
        <label className="mt-8 block text-[10px] tracking-[0.18em] uppercase text-[var(--muted)]">
          Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border border-[var(--line)] bg-transparent px-4 py-3 outline-none focus:border-[var(--gold)]"
          placeholder="••••••••"
          autoFocus
        />
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-6 w-full disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="mt-4 text-center text-[10px] text-[var(--muted)]">
          Demo: senha <code>livia2026</code>
        </p>
      </form>
    </div>
  );
}
