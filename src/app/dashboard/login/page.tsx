"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { brand } from "@/data/content";
import { IconBubble } from "@/components/ui/IconBubble";
import { Lock, Sparkles } from "@/lib/icons";

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
    <div className="dash-login relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[var(--gold)]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[var(--nude-deep)]/40 blur-3xl" />

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -2 }}
        className="dash-card relative z-10 w-full max-w-md p-8 md:p-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <IconBubble icon={Sparkles} tone="gold" size={20} className="!h-12 !w-12 !rounded-2xl" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="display mt-4 text-center text-3xl tracking-[0.15em] text-[var(--gold)]"
        >
          {brand.monogram}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="display mt-4 text-center text-3xl text-[var(--chocolate)]"
        >
          Área da clínica
        </motion.h1>
        <p className="mt-2 text-center text-sm text-[var(--muted)]">
          Acesso ao dashboard premium
        </p>
        <label className="mt-8 flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--muted)]">
          <Lock size={12} strokeWidth={1.8} />
          Senha
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/50 bg-white/40 px-4 py-3 outline-none transition focus:border-[var(--gold)]"
          placeholder="••••••••"
          autoFocus
        />
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-red-700"
          >
            {error}
          </motion.p>
        )}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 disabled:opacity-50"
        >
          <Lock size={14} strokeWidth={1.8} />
          {loading ? "Entrando..." : "Entrar"}
        </motion.button>
        <p className="mt-4 text-center text-[10px] text-[var(--muted)]">
          Demo: senha <code>livia2026</code>
        </p>
      </motion.form>
    </div>
  );
}
