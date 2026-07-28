export type StoryBeat = {
  id: string;
  /** Inclusive start as 0–1 progress through the scrubbable frame span */
  from: number;
  /** Exclusive end as 0–1 progress */
  to: number;
  eyebrow: string;
  title: string;
  body: string;
  script?: string;
  showCta?: boolean;
};

/**
 * Narrative beats synced to scroll progress (0→1 across cinematic frames).
 * Frame mapping is done in ScrollFilm via startFrame→lastFrame.
 */
export const storyBeats: StoryBeat[] = [
  {
    id: "limiar",
    from: 0,
    to: 0.1,
    eyebrow: "O Ritual do Cuidar",
    script: "cuidado",
    title: "Lívia Sodré",
    body: "O cuidado começa antes da porta — no silêncio do espaço que te espera.",
  },
  {
    id: "entrada",
    from: 0.1,
    to: 0.2,
    eyebrow: "Entrada",
    title: "Cruze o limiar",
    body: "A câmera te acompanha. O espaço respira com você.",
  },
  {
    id: "recepcao",
    from: 0.2,
    to: 0.34,
    eyebrow: "Recepção",
    title: "Seu atendimento começa aqui",
    body: "Do primeiro olhar ao agendamento — acolhimento em cada detalhe.",
  },
  {
    id: "acolhimento",
    from: 0.34,
    to: 0.46,
    eyebrow: "Acolhimento",
    title: "Você é vista de verdade",
    body: "Aqui você é cuidada por quem realmente faz a diferença.",
  },
  {
    id: "jornada",
    from: 0.46,
    to: 0.58,
    eyebrow: "Jornada",
    title: "Conheça cada ambiente",
    body: "Corredores, salas e rituais — um único plano contínuo de cuidado.",
  },
  {
    id: "procedimentos",
    from: 0.58,
    to: 0.74,
    eyebrow: "Procedimentos",
    title: "Tecnologia e cuidado em cada detalhe",
    body: "Micropigmentação, estética facial e corporal, cílios, unhas e spa.",
  },
  {
    id: "cuidado",
    from: 0.74,
    to: 0.86,
    eyebrow: "Especialistas",
    title: "Preparados para cuidar de você",
    body: "Mãos precisas, presença calma — o gesto que transforma.",
  },
  {
    id: "resultado",
    from: 0.86,
    to: 0.94,
    eyebrow: "Resultado",
    title: "Sua melhor versão começa hoje",
    body: "Beleza que transforma. Cuidado que conecta.",
  },
  {
    id: "convite",
    from: 0.94,
    to: 1.01,
    eyebrow: "Agende",
    title: "O próximo frame é o seu horário",
    body: "Escolha o serviço e reserve em poucos cliques — sem filas, sem espera.",
    showCta: true,
  },
];

export function activeBeat(progress: number): StoryBeat {
  const p = Math.min(1, Math.max(0, progress));
  return (
    storyBeats.find((b) => p >= b.from && p < b.to) ??
    storyBeats[storyBeats.length - 1]
  );
}
