export type StoryBeat = {
  id: string;
  from: number;
  to: number;
  eyebrow: string;
  title: string;
  body: string;
  script?: string;
  showCta?: boolean;
};

/** Beats for hero-master (0–67%) + sora-hero-8s extension (67–100%). */
export const storyBeats: StoryBeat[] = [
  {
    id: "limiar",
    from: 0,
    to: 0.12,
    eyebrow: "O Ritual do Cuidar",
    script: "cuidado",
    title: "Lívia Sodré",
    body: "O cuidado começa antes da porta — no silêncio da fachada que te convida.",
  },
  {
    id: "entrada",
    from: 0.12,
    to: 0.28,
    eyebrow: "Entrada",
    title: "Cruze o limiar",
    body: "A câmera te acompanha pela porta. O espaço respira com você.",
  },
  {
    id: "recepcao",
    from: 0.28,
    to: 0.48,
    eyebrow: "Recepção",
    title: "Seu atendimento começa aqui",
    body: "Luz quente, flores e acolhimento — do primeiro olhar ao cuidado.",
  },
  {
    id: "acolhimento",
    from: 0.48,
    to: 0.67,
    eyebrow: "Acolhimento",
    title: "Você é vista de verdade",
    body: "Aqui você é cuidada por quem realmente faz a diferença.",
  },
  {
    id: "atmosfera",
    from: 0.67,
    to: 0.88,
    eyebrow: "Ambiente",
    title: "Tecnologia e cuidado em cada detalhe",
    body: "O espaço continua — texturas, luz e a calma de um ritual premium.",
  },
  {
    id: "convite",
    from: 0.88,
    to: 1.01,
    eyebrow: "Agende",
    title: "Sua melhor versão começa hoje",
    body: "Escolha o serviço e reserve em poucos cliques — beleza que transforma.",
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
