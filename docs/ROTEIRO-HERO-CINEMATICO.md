# Roteiro Cinematográfico — Seção 01 (Hero Scroll)

**Projeto:** Lívia Sodré — Estética Avançada, Micropigmentação e Spa  
**Formato final:** sequência de frames (AVIF → WebP fallback) scrubada no scroll via Canvas + GSAP ScrollTrigger  
**Duração lógica do filme:** 8,0 s @ 24 fps → **192 frames** (export otimizado: **96 frames** @ 12 fps equivalentes, interpolação visual via scrub)  
**Aspecto:** 16:9 master (1920×1080), crop inteligente para mobile (9:16 center-weighted)  
**Paleta:** nude `#F0E6D8`, cream `#FAF6F0`, chocolate `#2C1F1A`, gold `#B8956A`  
**Mood refs:** Apple product films · Rivian nature luxury · Framer site stillness · Linear soft depth  

---

## 1. Narrativa (story spine)

| Beat | Tempo | Progresso scroll | Intenção |
|------|-------|------------------|----------|
| **0 — Black breath** | 0.0–0.6s | 0–8% | Silêncio visual. Fundo cream quente quase vazio. Respiração antes da marca. |
| **1 — Monogram birth** | 0.6–1.8s | 8–22% | Monograma **LS** nasce em ouro fino, como metal aquecido. Partículas douradas flutuam. |
| **2 — Botanical reveal** | 1.8–3.0s | 22–38% | Ramo botânico (do logo) atravessa o LS. Luz lateral suave (Rembrandt warm). |
| **3 — Arch portal** | 3.0–4.4s | 38–55% | Câmera avança por um arco arquitetônico nude. Profundidade de campo rasa. |
| **4 — Ritual of care** | 4.4–5.8s | 55–72% | Detalhe: mãos / ventosa / luz dourada sobre pele — sem rosto identificável (privacidade + universalidade). |
| **5 — Space & light** | 5.8–7.0s | 72–88% | Pull-back para ambiente spa: mármore quente, arco, sombra dourada. |
| **6 — Brand lockup** | 7.0–8.0s | 88–100% | Título “Lívia Sodré” + tagline. CTA entra. Frame final estático para handoff à página. |

**Mensagem emocional:** “Você entra num ritual de cuidado — não num site de clínica.”

---

## 2. Direção de arte

### Identidade
- Tipografia no frame: serif display (Cormorant) + script (Great Vibes) apenas no overlay HTML — **não burn-in no vídeo** (textos animados via SplitType no DOM para SEO/acessibilidade).
- No vídeo: apenas formas, luz, monograma, texturas, atmosfera.
- Evitar: saturação alta, neon, roxo, UI fake, texto amarelo, look “IA genérica”.

### Composição
- Regra dos terços + eixo central vertical para monograma (simetria premium).
- Negative space generoso (estilo Apple keynote stills).
- Camadas: foreground partículas · mid monograma/arco · background luz volumétrica.

### Iluminação
- Key light quente 3200K, 35° camera-left.
- Rim light dourado suave contornando o arco.
- Fill cream baixo contraste (evitar pretos absolutos; pretos = chocolate `#1A1411`).
- God rays sutis no beat 3–5 (volumetric, baixa densidade).

### Materiais / texturas
- Mármore nude com veios quase invisíveis.
- Metal brushed gold (LS).
- Linho / algodão out-of-focus no beat 4.
- Poeira luminosa (gold dust) — densidade baixa, tamanho micro.

---

## 3. Câmera & lentes (por beat)

| Beat | Lente equiv. | Movimento | Notas para frames |
|------|--------------|-----------|-------------------|
| 0 | 50mm | Static hold | 8–10 frames quase idênticos (hold) |
| 1 | 85mm | Extremely slow push-in 2% | Monograma escala 92→100% |
| 2 | 85mm | Micro orbit yaw ±3° | Continuity com LS |
| 3 | 35mm | Dolly forward through arch | Parallax forte — ideal para scrub |
| 4 | 100mm macro | Lateral slide L→R | Detalhe tátil |
| 5 | 24mm | Crane up + pull back | Reveal do espaço |
| 6 | 40mm | Settle to locked frame | Hold final 12+ frames |

**Easing de câmera (para geração):** ease-in-out cubic, zero cuts hard — um único plano contínuo (one-shot) ou dissolves de 6–8 frames entre beats.

**Transições:** cross-dissolve suave entre 2→3 e 4→5 (6 frames). Demais: continuous move.

---

## 4. Storyboard beat-a-beat (frames-chave)

### Beat 0 — Black breath
- **Frame 001–012:** campo cream texturizado, vignette chocolate 8%. Sem elementos.
- **Áudio mental:** silêncio.
- **Overlay HTML:** nenhum.

### Beat 1 — Monogram birth
- **Frame 013–036:** LS em ouro aparece via reveal de luz (não fade simples) — highlight percorre o metal.
- **Partículas:** 40–60 sparks ascendentes lentos.
- **Overlay HTML (scroll 10–20%):** eyebrow “ESTÉTICA AVANÇADA · MICROPIGMENTAÇÃO · SPA” (SplitType chars).

### Beat 2 — Botanical
- **Frame 037–060:** sprig botânico (como no logo) cresce verticalmente pelo centro do LS.
- **Overlay:** monograma some do DOM (só no canvas) — texto ainda mínimo.

### Beat 3 — Arch portal
- **Frame 061–090:** arco full-bleed; câmera entra; bokeh dourado nas bordas.
- **Overlay (38–55%):** palavra “cuidado” em script gold, opacity scrub.

### Beat 4 — Ritual
- **Frame 091–120:** close de cuidado (mãos, ferramenta estética elegantes, sem gore/clínica fria).
- **Overlay:** “Aqui você é cuidada por quem realmente faz a diferença.”

### Beat 5 — Space
- **Frame 121–150:** interior spa wide; arco + luz; sensação de lugar real.
- **Overlay:** subtítulo Guaratiba · RJ.

### Beat 6 — Lockup
- **Frame 151–192:** composição limpa; espaço negativo à esquerda para tipografia DOM.
- **Overlay HTML final:**
  - H1: Lívia Sodré
  - Script: Beleza que transforma
  - Sub: Beleza que transforma. Cuidado que conecta.
  - CTAs: Agendar · Ver serviços
- **Frame 180–192:** hold estático (permite pin release suave).

---

## 5. Prompt master (geração de vídeo)

```
Cinematic luxury beauty spa brand film, continuous slow camera move, warm nude beige and chocolate brown color grade, soft gold accents, elegant architectural arch, brushed gold LS monogram, delicate botanical sprig, marble and linen textures, volumetric warm light, shallow depth of field, Apple-style product cinematography, no text overlays, no logos other than abstract LS monogram, no faces, no UI, 16:9, photoreal, high-end wellness clinic atmosphere, Guaratiba Rio de Janeiro mood, refined and serene
```

**Negative:** neon, purple, cyberpunk, cartoon, watermark, subtitle, busy clutter, harsh flash, medical gore, stock smile closeup.

---

## 6. Pipeline técnico de frames

1. Gerar vídeo master 8s 24fps 1080p (Veo / Gemini).
2. FFmpeg: extrair **96 frames** (`fps=12`) em PNG intermediário.
3. Converter para **AVIF** (quality 50–55) + **WebP** fallback (quality 72).
4. Naming: `frame-000.webp` / `frame-000.avif` … `frame-095.*`
5. Manifest JSON: `{ total, width, height, formats: ["avif","webp"], pad: 3 }`
6. Worker prefetch batches de 12 frames; preload primeiros 8.
7. Canvas drawImage com object-fit cover; DPR capped em 2.
8. ScrollTrigger: pin section `end: "+=300%"` (desktop) / `+=220%` (mobile), `scrub: 0.6`.
9. Lenis + ScrollTrigger.update no raf.
10. prefers-reduced-motion: frame final estático + textos sem split scrub.

---

## 7. Overlay tipográfico (sincronizado)

| Progress | Elemento | Animação |
|----------|----------|----------|
| 0.05–0.18 | Eyebrow | SplitType chars, stagger 0.02, y:20→0 |
| 0.20–0.35 | “LS” ghost (DOM optional) | opacity pulse via anime.js |
| 0.38–0.52 | Script “cuidado” | clip-path reveal |
| 0.55–0.70 | Quote linha | fade + blur 4→0 |
| 0.72–0.85 | Location | letter-spacing collapse |
| 0.88–1.0 | H1 + CTAs | split words + buttons anime.js |

---

## 8. Performance budget

- Total frames AVIF ~96 × ~25–40KB ≈ **2.5–4MB** (lazy batches).
- First paint: 8 frames preload ≈ 250KB.
- Canvas único, sem DOM images.
- Worker decode; main thread só blit + GSAP.
- LCP: poster frame AVIF estático no HTML até idle.

---

## 9. Acessibilidade

- `aria-hidden` no canvas decorativo.
- Textos reais no DOM (não só no vídeo).
- Reduced motion: sem pin longo; hero estático com frame 095.
- Contraste textos cream/chocolate ≥ WCAG AA.

---

## 10. Entregáveis desta seção

- [x] Roteiro (este documento)
- [x] Vídeo master (`public/cinematic/source/hero-master.mp4`) — montado via keyframes + FFmpeg (Veo API em quota 429)
- [x] 96 frames AVIF + WebP (`public/cinematic/frames/`)
- [x] `ScrollCanvasHero` + Lenis provider
- [x] SplitType + Anime.js overlays
- [x] Integração na landing page
