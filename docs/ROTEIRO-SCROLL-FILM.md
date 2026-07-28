# Roteiro — Scroll Film contínuo · Lívia Sodré

**Título:** *Um dia de cuidado*  
**Formato:** um único filme interativo · **vídeos só como fonte de frames** · **zero `<video>` na UI**  
**Experiência:** Apple / Tesla / Arc — o scroll escolhe o frame  
**Modelo de geração:** `sora-2-pro` (preferência) ou `sora-2` · 1280×720 ou 1792×1024  
**Export de frames:** 12–15 fps · WebP q96 (+ AVIF opcional) · pad 4 dígitos  

---

## Princípio absoluto

1. O usuário **nunca** vê um player de vídeo.
2. Cada clipe vira **centenas de imagens** (`frame-0001.webp` …).
3. O scroll mapeia `progress 0→1` → `frame start→end`.
4. **Continuidade obrigatória:** último frame do clipe N = primeiro frame do clipe N+1  
   (mesma câmera, luz, enquadramento, direção). Sem corte perceptível.
5. A landing inteira é **uma narrativa visual**; textos mudam no tempo certo dos frames.

---

## Arc emocional

| Fase | Sensação | O que o scroll revela |
|------|----------|------------------------|
| Chegada | Convite / silêncio | Fachada → porta |
| Entrada | Transição | Dolly through a porta |
| Acolhimento | Confiança | Recepção / balcão |
| Descoberta | Curiosidade | Corredor / ambientes |
| Cuidado | Entrega | Procedimentos |
| Transformação | Leveza | Resultado / olhar |
| Convite | Decisão | CTA agendar |

**Frase-guia:** *Beleza que transforma. Cuidado que conecta.*

---

## Clipes (fonte → frames)

Cada clipe ~4–6 s. Encadear com `input_reference` = último frame do anterior.

| # | ID | Movimento | Conteúdo | Frames alvo (aprox.) |
|---|-----|-----------|----------|----------------------|
| 01 | `fachada` | Dolly In / Crane baixo | Exterior nude-cream, arco, placa sutil, golden hour | 000–040 |
| 02 | `entrada` | Push In + Gimbal | Porta entreabre, câmera atravessa o limiar | 040–075 |
| 03 | `recepcao` | Tracking lento | Balcão, flores, luz quente, acolhimento | 075–110 |
| 04 | `acolhimento` | Orbit suave 15° | Cliente recebida, sorriso, mãos guiando | 110–145 |
| 05 | `corredor` | Gimbal Walking | Corredor nude, portas em arco, profundidade | 145–180 |
| 06 | `ambientes` | Pan + Dolly | Salas de estética / spa, equipamentos discretos | 180–220 |
| 07 | `procedimentos` | Push In / Macro suave | Sobrancelha, micropigmentação ou facial (sem gore) | 220–270 |
| 08 | `atendimento` | Tracking + Tilt up | Profissional em cuidado, detalhe das mãos | 270–310 |
| 09 | `resultado` | Dolly Out lento | Cliente no espelho, expressão leve, luz envolvente | 310–350 |
| 10 | `encerramento` | Crane / Hold | Volta ao espaço / marca em silêncio visual (sem texto burn-in) | 350–380 |

**Total alvo:** ~360–400 frames @ 12–15 fps export.

---

## Continuidade (contrato visual)

| Ponte | Frame final A = Frame inicial B |
|-------|----------------------------------|
| 01→02 | Porta do arco entreaberta, spill de luz warm para dentro |
| 02→03 | Interior do foyer, balcão ao fundo, mesma LUT |
| 03→04 | Cliente no balcão, 3/4, mesma altura de câmera |
| 04→05 | Início do corredor, ombros da profissional à frente |
| 05→06 | Porta de sala entreaberta, luz da sala |
| 06→07 | Maca / cadeira, mãos entrando no quadro |
| 07→08 | Close médio do gesto de cuidado |
| 08→09 | Espelho entra no quadro |
| 09→10 | Espelho / espaço abre, câmera recua |

**Checklist por ponte:** posição · FOV · temperatura 3200K · exposição · direção do olhar · sem salto de eixo.

---

## Scroll storytelling (UI)

| Progresso scroll | Frame (relativo) | Seção de texto |
|------------------|------------------|----------------|
| 0–8% | início | *Limiar* — “O cuidado começa antes da porta.” |
| 8–18% | | *Entrada* — “Cruze o limiar. O espaço respira com você.” |
| 18–32% | | *Recepção* — “Seu atendimento começa aqui.” |
| 32–42% | | *Acolhimento* — “Aqui você é cuidada por quem faz a diferença.” |
| 42–55% | | *Jornada* — “Conheça cada ambiente do seu ritual.” |
| 55–72% | | *Procedimentos* — “Tecnologia e cuidado em cada detalhe.” |
| 72–85% | | *Cuidado* — “Especialistas preparados para você.” |
| 85–94% | | *Resultado* — “Sua melhor versão começa hoje.” |
| 94–100% | fim | *Convite* — CTA Agendar / WhatsApp |

Textos **nunca** vão no vídeo — só no DOM, sincronizados ao progresso.

---

## Pipeline técnico

```bash
# 1) Gerar clipes Sora com continuidade (input_reference)
# 2) Concatenar master (só para extrair frames — não publicar MP4 na UI)
ffmpeg -f concat -i list.txt -c copy master.mp4

# 3) Extrair frames HQ
node tools/extract-frames.mjs --input public/cinematic/source/hero-master.mp4 --out public/cinematic/frames --fps 12 --quality 96

# 4) Atualizar public/cinematic/manifest.json (total, startFrame, beats)
```

### Regras de performance

- Formatos: **WebP** (mobile + fallback) · AVIF opcional desktop  
- Worker: warm janela ±10 · batches progressivos  
- Canvas: desenha só o frame necessário · `ImageBitmap` · cache `force-cache`  
- Prefetch poster + primeiros 16–24 frames  
- Sem Lenis conflict: `ScrollTrigger.update` no scroll · `refresh` após load  

### Anti-padrões

- ❌ `<video autoplay>` / scrub de MP4 na página  
- ❌ Cortes secos entre clipes  
- ❌ Texto burn-in nos frames  
- ❌ Mudança de LUT / câmera entre capítulos  
- ❌ Hero isolada sem continuidade nas seções  

---

## Prompts-base (Sora)

**Global negative / constraints (todos os clipes):**  
No on-screen text, logos, UI, watermarks. No blood, needles in extreme close-up, horror. Photoreal premium spa clinic, warm 3200K, nude/cream/chocolate/gold palette, shallow DOF, continuous single take feel, women respectfully framed, Guaratiba-Rio sophisticated boutique clinic.

Usar o prompt de cada linha da tabela + “Continue exactly from the reference still; match camera height, lens, lighting and composition.”

---

## Estado atual do site

Enquanto novos clipes Pro não forem gerados, o `manifest.json` mapeia o master contínuo existente (4 capítulos) nos **beats de UI** acima — mesma mecânica de scroll-film, sem reproduzir vídeo.
