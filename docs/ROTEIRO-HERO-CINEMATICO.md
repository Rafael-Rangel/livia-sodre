# Roteiro Premium v2 — Hero Cinematográfico Lívia Sodré

**Referências:** Apple product films · Rivian stillness · Framer spatial scroll · Linear depth · Stripe clarity  
**Modelo:** OpenAI `sora-2-pro` · 1792×1024 · 8s · 24fps lógico → **120 frames** export (@15fps)  
**Grade de cor:** nude `#EDE4D6` · cream `#FAF6F0` · chocolate `#1F1612` · gold `#C4A574`  
**Regra de ouro:** zero texto no vídeo · tipografia 100% no DOM (SplitType) · um plano contínuo (one-shot)

---

## Narrativa emocional

> “Você não entra num site. Você entra num ritual de silêncio, luz e cuidado.”

Arco: **vazio → marca → portal → intimidade → espaço → presença da marca.**

---

## Beats (para scrub de scroll 0→100%)

| % | Tempo | Beat | Câmera | Imagem |
|---|-------|------|--------|--------|
| 0–10 | 0.0–0.8s | **Respiro** | Hold 50mm | Campo cream quase vazio, vignette chocolate 6%, poeira dourada micro |
| 10–25 | 0.8–2.0s | **Monograma** | Push 2% 85mm | LS em ouro brushed nasce com highlight metal (sem tipografia extra) |
| 25–40 | 2.0–3.2s | **Botânico** | Micro orbit | Sprig fino atravessa o LS; luz Rembrandt 3200K |
| 40–58 | 3.2–4.6s | **Portal** | Dolly through arch 35mm | Arco arquitetônico nude full-bleed; DOF rasa; god rays soft |
| 58–75 | 4.6–6.0s | **Ritual** | Macro lateral 100mm | Detalhe tátil (vidro/ventosa/linho/ouro) — **sem rostos** |
| 75–90 | 6.0–7.2s | **Espaço** | Crane + pull 24mm | Interior spa sereno; mármore quente; arco ao fundo |
| 90–100 | 7.2–8.0s | **Lockup plate** | Settle lock | Negative space à esquerda para H1/CTA no overlay |

**Transições:** sem corte seco — dissolves de 4–6 frames ou move contínuo.  
**Easing:** ease-in-out cúbico em todo movimento de câmera.

---

## Direção de arte

- Materiais: mármore nude, linho, metal brushed gold, gesso quente
- Iluminação: key warm left 35°, rim gold, fill cream baixo contraste
- Proibido: neon, roxo, UI, watermark, faces, texto, clutter clínico frio
- Continuidade: mesma temperatura de cor em todos os beats (LUT única)

## Overlay tipográfico (DOM)

| Progress | Conteúdo |
|----------|----------|
| 0.06–0.18 | Eyebrow: ESTÉTICA AVANÇADA · MICROPIGMENTAÇÃO · SPA |
| 0.22–0.40 | Script: “cuidado” |
| 0.45–0.65 | Quote da marca |
| 0.78–1.00 | H1 Lívia Sodré + tagline + CTAs |

## Prompt master (Sora-2-Pro)

Ver geração via API — prompt único continuous shot, photoreal, anamorphic softness, luxury wellness, Guaratiba mood sem landmark literal.

## Pipeline HQ

1. Sora-2-Pro 8s 1792×1024  
2. FFmpeg → 120 PNG master  
3. AVIF CRF 28 (mais qualidade) + WebP q=82  
4. Canvas cover + scrub 0.55 + Lenis  
5. Prefetch 10 primeiros frames · worker batches 10
