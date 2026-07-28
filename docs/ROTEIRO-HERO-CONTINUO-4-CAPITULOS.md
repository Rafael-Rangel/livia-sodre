# Roteiro Cinematográfico Contínuo — Hero Lívia Sodré

**Título da peça:** *O Ritual do Cuidar*  
**Conceito:** Um único filme interativo em 4 capítulos. O scroll não “troca de vídeo” — atravessa um dia de cuidado na clínica, do limiar ao bem-estar.  
**Refs:** Apple product films · Rivian stillness · Framer spatial scroll · Linear depth  
**Modelo sugerido:** `sora-2` (produção) / `sora-2-pro` (master) · **1280×720** · continuidade via **last frame → first frame** (`input_reference`)  
**Paleta:** nude `#EDE4D6` · cream `#FAF6F0` · chocolate `#1F1612` · gold `#C4A574`  
**Regras globais:** mesma LUT; mesma temperatura 3200K; câmera lenta e contínua; sem logos/UI/texto burn-in; sem gore clínico; realismo premium; rostos suaves e respeitosos (sem close extremo de agulha/sangue).

---

## Arc emocional (filme único)

| Momento | Sensação | Beat narrativo |
|---------|----------|----------------|
| Entrada | Silêncio / convite | O espaço respira antes de você |
| Acolhimento | Confiança | Você é vista e recebida |
| Cuidado | Entrega / ritual | A transformação acontece no gesto |
| Renascimento | Leveza / presença | Bem-estar + marca |

**Frase-guia:** *“Beleza que transforma. Cuidado que conecta.”*

---

## Continuidade técnica (obrigatória)

Para cada capítulo `N → N+1`:

1. Gerar vídeo `N`.
2. Extrair **último frame** (`END_N`).
3. Gerar vídeo `N+1` com `input_reference = END_N` + prompt do capítulo.
4. Validar que o **primeiro frame** de `N+1` ≈ `END_N` (mesma composição, luz, posição).
5. Concatenar lógica de scroll: frames de todos os capítulos em sequência única no Canvas.

**Bridge frame (contrato visual entre capítulos):**

| Transição | Frame final (A) = Frame inicial (B) |
|-----------|-------------------------------------|
| Cap.1 → 2 | Exterior do arco da clínica, porta entreaberta, luz warm spill para dentro |
| Cap.2 → 3 | Mãos de Lívia guiando a paciente pelo corredor nude, perfil 3/4, DOF rasa |
| Cap.3 → 4 | Close suave do olhar da paciente (olhos fechados → quase abrindo), luz gold lateral |
| Cap.4 → fim | Plano aberto da paciente + Lívia no lobby, negative space à esquerda p/ tipografia |

---

# CAPÍTULO 1 — “Limiar” (Apresentação da clínica)

**Duração:** 5s  
**Objetivo:** Estabelecer o mundo premium. Sem pressa. O lugar fala antes das pessoas.  
**Personagens:** nenhum (espaço como protagonista).

### Cenas
1. **0.0–1.2s** — Campo cream quase vazio; poeira dourada micro; vignette chocolate suave.  
2. **1.2–3.0s** — Push lento revela fachada/arco em gesso nude; mármore; botânico sutil.  
3. **3.0–5.0s** — Dolly através do arco; porta de madeira clara entreabre; spill de luz warm para o interior.

### Câmera
- Lente 35→40mm equivalente  
- Dolly forward contínuo (sem corte)  
- Altura peito humano (~1,45m)  
- Velocidade: extremamente lenta

### Iluminação
- Golden hour lateral esquerda  
- Rim gold no arco  
- Interior ainda misterioso (underexposto ½ stop)

### Frame inicial (prompt still)
```
Photoreal still, first frame, empty warm cream void with micro gold dust motes, soft chocolate vignette, almost abstract, luxury wellness mood, no people, no text, 16:9, Apple cinematic grade
```

### Frame final / Bridge para Cap.2 (prompt still)
```
Photoreal still, last frame continuity lock: elegant nude plaster arch doorway of a high-end beauty clinic, light wood door slightly ajar, warm 3200K light spilling from interior into beige marble threshold, shallow depth of field, botanical hint, no people yet, no text, 16:9, consistent warm LUT
```

### Prompt completo — Vídeo Cap.1
```
Single continuous 5-second cinematic shot, Apple-style luxury wellness film. Begin on nearly empty cream atmosphere with soft gold dust. Extremely slow dolly forward reveals a high-end beauty clinic facade with tall nude plaster arch and warm beige marble. Camera moves through the arch as a light wood door gently opens, warm interior light spilling onto the threshold. Shallow depth of field, 3200K key from camera-left, gold rim light, chocolate soft shadows, photoreal, serene Guaratiba spa architecture mood. No people, no faces, no text, no logos, no UI, no neon. Continuous one-shot, no hard cuts.
```

### Overlay tipográfico (scroll ~0–22%)
- Eyebrow: Estética avançada · Micropigmentação · Spa  
- Script: *cuidado*

---

# CAPÍTULO 2 — “Acolhimento” (Chegada + recepção)

**Duração:** 6s  
**Objetivo:** Humanizar. Lívia recebe. A paciente chega. Confiança nasce no olhar e no gesto.  
**Personagens:**  
- **Lívia** — 30–40 anos, presença calorosa, jaleco/uniforme chocolate elegante ou vestido nude sofisticado, cabelo arrumado, sorriso sereno  
- **Paciente** — mulher 25–40, roupa casual premium (linen/beige), nervosismo leve que se dissolve

### Cenas
1. **0.0–1.5s** — Continua do bridge: porta abre; Lívia aparece no limiar, gesticula “entre”.  
2. **1.5–3.5s** — Tracking lateral suave na recepção: madeira clara, flores secas, monograma LS sutil em metal (não tipografia digital).  
3. **3.5–6.0s** — Lívia guia a paciente pelo corredor nude; mãos quase se tocando (acolhimento); luz de janela.

### Câmera
- 40mm → 50mm  
- Steadicam suave  
- Começa no mesmo frame do Cap.1 END  
- Termina em plano 3/4 das duas caminhando para o fundo do corredor

### Iluminação
- Mesma LUT do Cap.1  
- Prática de janela lateral  
- Fill cream baixo contraste nos rostos (beleza natural, sem beauty-filter plástico)

### Frame inicial (DEVE = Cap.1 END)
```
Photoreal still matching previous last frame exactly: nude plaster arch, light wood door ajar, warm interior spill on marble threshold, same camera height and angle, ready for a woman to appear in doorway, no text, 16:9, identical color grade
```

### Frame final / Bridge para Cap.3
```
Photoreal still continuity lock: Lívia Sodré (warm Brazilian woman, elegant chocolate clinic attire) gently guiding a female patient by the forearm down a nude beige clinic corridor, three-quarter profile, soft window light from the left, shallow DOF, serene expressions, marble floor, botanical accent, no medical tools visible yet, no text, 16:9, same warm LUT
```

### Prompt completo — Vídeo Cap.2
```
Continue seamlessly from the previous locked frame: the ajar clinic door. Single continuous 6-second shot. Lívia, a warm elegant Brazilian woman in refined chocolate clinic attire, appears in the doorway with a welcoming smile and invites a female patient inside. Smooth steadicam follow into a premium nude-beige reception with wood, dried flowers, soft gold accents. Then they walk together down a luminous corridor; Lívia guides gently by the forearm. Extremely slow camera, shallow depth of field, 3200K lighting consistent with prior shot, photoreal cinematic wellness film, Apple/Rivian grade. No text, no logos, no UI, no gore, no needles. Natural authentic expressions, premium spa clinic in Rio.
```

### Overlay (scroll ~22–45%)
- Quote: “Aqui você é cuidada por quem realmente faz a diferença.”

---

# CAPÍTULO 3 — “Ritual” (Atendimento + serviços)

**Duração:** 7s  
**Objetivo:** Mostrar o cuidado como ritual — não procedimento frio. Serviços: micropigmentação / estética facial / bem-estar (sugeridos por gesto e luz, sem explicitar sangue ou dor).  
**Personagens:** Lívia + paciente (+ opcional Yamê ao fundo, fora de foco)

### Cenas
1. **0.0–1.8s** — Continua do corredor: entram numa sala de atendimento soft; paciente senta.  
2. **1.8–4.2s** — Over-the-shoulder: Lívia prepara com delicadeza (luvas nude, instrumentos elegantes desfocado); luz lateral gold.  
3. **4.2–7.0s** — Macro tátil: mãos, toque suave no rosto/sobrancelha (sugestão de design/micropigmentação), paciente respira; olhos fechados em confiança → quase abrindo.

### Câmera
- 50mm → 85mm → 100mm macro  
- Push in emocional  
- Sem cortes; morph de distância via move contínuo

### Iluminação
- Softbox warm key  
- Catchlight nos olhos  
- Background chocolate suave

### Frame inicial (= Cap.2 END)
```
Exact continuity from previous: Lívia guiding patient down nude corridor, three-quarter view, same positions, lighting, wardrobe; camera about to enter treatment room doorway, no text, 16:9
```

### Frame final / Bridge para Cap.4
```
Photoreal still continuity lock: intimate close-up of the female patient's face in soft profile, eyes gently opening after care, warm gold side light, serene almost-smile, shallow DOF, cream background blur, no instruments in frame, no text, 16:9, same LUT
```

### Prompt completo — Vídeo Cap.3
```
Seamless continuation from corridor shot. Single continuous 7-second cinematic sequence inside a premium aesthetic treatment room with nude walls and soft linens. Patient sits; Lívia prepares gently with elegant tools softly out of focus. Camera slowly pushes to an intimate macro of caring hands near the brow/face suggesting advanced aesthetics and micropigmentation without showing needles or blood. Patient exhales, eyes closed in trust, then slowly begins to open. Warm 3200K lighting, gold accents, shallow depth of field, photoreal, respectful, luxurious, Apple-grade wellness cinematography. No text, no logos, no gore, no clinical harshness.
```

### Overlay (scroll ~45–72%)
- H1 começa a revelar: **Lívia Sodré**  
- Sub: serviços implícitos na atmosfera

---

# CAPÍTULO 4 — “Renascimento” (Resultado + bem-estar + marca)

**Duração:** 6s  
**Objetivo:** Emoção final. Bem-estar. Conexão humana. Espaço negativo para tipografia/CTA.  
**Personagens:** Lívia + paciente (abraço leve ou mãos dadas) ; possível silhueta da equipe ao fundo

### Cenas
1. **0.0–2.0s** — Continua do close: pull back revela sorriso pleno; paciente se olha (espelho desfocado).  
2. **2.0–4.2s** — Plano médio: Lívia e paciente no lobby/arco, luz da manhã; riso contido, gratidão.  
3. **4.2–6.0s** — Settle lock: composição com **negative space à esquerda**; direita: duo humanizado; hold estável para CTAs.

### Câmera
- 85mm → 40mm pull back  
- Crane micro up  
- Lock final estático 1s+

### Iluminação
- Mais aberta / high-key cream  
- Sol matinal no arco  
- Highlights gold suaves

### Frame inicial (= Cap.3 END)
```
Exact continuity: patient close-up eyes just opening, warm gold side light, serene expression, identical framing to previous last frame, 16:9
```

### Frame final (lockup plate do site)
```
Photoreal still final lockup: wide elegant composition of Lívia and patient standing near the nude clinic arch in warm morning light, genuine soft smiles, generous empty negative space on the LEFT third for website typography overlay, shallow DOF, premium wellness atmosphere, no text in image, 16:9, same LUT
```

### Prompt completo — Vídeo Cap.4
```
Seamless continuation from the intimate eye-opening close-up. Single continuous 6-second shot. Camera gently pulls back as the patient smiles with renewed confidence; soft mirror reflection out of focus. Cutless move into lobby by the nude arch where Lívia and the patient share a warm grateful moment. Final settle into a locked wide frame with generous empty negative space on the left for typography, subjects on the right, morning light, cream and gold grade, photoreal cinematic wellness ending, Apple keynote stillness. No text, no logos, no UI.
```

### Overlay (scroll ~72–100%)
- H1: Lívia Sodré  
- Tagline: Beleza que transforma. Cuidado que conecta.  
- CTAs: Agendar · Ver serviços  
- Hint: Scroll some (some some some some)

---

## Mapa de scroll (Hero = um filme)

| Progresso scroll | Capítulo | Conteúdo visual | Texto DOM |
|------------------|----------|-----------------|-----------|
| 0–22% | 1 Limiar | Espaço / arco / porta | eyebrow + “cuidado” |
| 22–45% | 2 Acolhimento | Recepção / guia | quote |
| 45–72% | 3 Ritual | Atendimento / gesto | H1 parcial |
| 72–100% | 4 Renascimento | Resultado / lockup | H1 + tagline + CTAs |

**Pin sugerido:** `+=420%` desktop / `+=300%` mobile  
**Frames totais alvo:** ~4× (5–7s @ 12–15fps export) ≈ **280–360 frames** na timeline única

---

## Pipeline de produção

1. Gerar **still START_1** (opcional) → Vídeo Cap.1  
2. Extrair `END_1.png`  
3. Vídeo Cap.2 com `input_reference=END_1`  
4. Extrair `END_2.png` → Cap.3  
5. Extrair `END_3.png` → Cap.4  
6. Extrair todos os frames AVIF/WebP em pasta sequencial `frame-000…`  
7. Manifest único `{ total, chapters: [{start,end,id}] }`  
8. Canvas + GSAP ScrollTrigger scrub contínuo

### Prompt negativo (todos)
```
text, watermark, logo board, UI, neon, purple cyberpunk, blood, needles close-up, hospital fluorescent green, stock smile exaggerated, low-res, jitter, hard cuts, camera shake handheld documentary
```

---

## Casting / direção de atores (notas)

**Lívia**
- Presença mãe + mentora; sorriso de olhos; gestos lentos  
- Nunca “vender”; sempre “cuidar”

**Paciente**
- Arco: tensão leve → entrega → leveza  
- Evitar maquiagem pesada no início; glow natural no final

---

## Alternativa de narrativa (se preferir mais impactante)

**Título:** *Um espelho, duas mulheres*  
Foco total em reflexão: a paciente vê no espelho não só o resultado estético, mas a versão cuidada de si — com Lívia ao fundo como presença. Mesmos 4 capítulos, porém Cap.3 e Cap.4 orbitam o espelho como motivo visual recorrente (boa continuidade de props).

---

## Checklist de continuidade

- [ ] END_1 == START_2 (arco + porta)  
- [ ] END_2 == START_3 (corredor 3/4)  
- [ ] END_3 == START_4 (close olhos)  
- [ ] LUT idêntica em todos  
- [ ] Wardrobe Lívia consistente  
- [ ] Sem texto nos frames  
- [ ] Negative space final à esquerda  

---

## Próximo passo de execução

Gerar Cap.1 → encadear Cap.2–4 com `input_reference` → exportar frames → atualizar `ScrollCanvasHero` para timeline multi-capítulo.
