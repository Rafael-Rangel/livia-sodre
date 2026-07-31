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

/**
 * Beats for the active scroll film:
 * sora-hero-8s only (frames 245–364) - atmosfera interior
 */
export const storyBeats: StoryBeat[] = [
  {
    id: "limiar",
    from: 0,
    to: 0.22,
    eyebrow: "O Ritual do Cuidar",
    script: "cuidado",
    title: "Lívia Sodré",
    body: "Entre no espaço onde cada detalhe foi pensado para acolher você.",
  },
  {
    id: "ambiente",
    from: 0.22,
    to: 0.48,
    eyebrow: "Ambiente",
    title: "Luz, textura e calma",
    body: "Arcos, mármore e o monograma LS: a atmosfera de um ritual premium.",
  },
  {
    id: "experiencia",
    from: 0.48,
    to: 0.72,
    eyebrow: "Experiência",
    title: "Tecnologia e cuidado",
    body: "Cada canto da clínica respira elegância e bem-estar em silêncio.",
  },
  {
    id: "convite",
    from: 0.72,
    to: 1.01,
    eyebrow: "Agende",
    title: "Sua melhor versão começa hoje",
    body: "Escolha o serviço e reserve em poucos cliques. Beleza que transforma.",
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
