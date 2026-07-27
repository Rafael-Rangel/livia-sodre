export type ServiceCategory =
  | "facial"
  | "corporal"
  | "micropigmentacao"
  | "unhas"
  | "cilios"
  | "depilacao";

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMin: number;
  priceFrom: number;
  featured?: boolean;
  popular?: boolean;
};

export const categoryLabels: Record<ServiceCategory, string> = {
  facial: "Estética Facial",
  corporal: "Estética Corporal",
  micropigmentacao: "Micropigmentação",
  unhas: "Unhas & Nail Design",
  cilios: "Cílios & Sobrancelhas",
  depilacao: "Depilação",
};

export const services: Service[] = [
  {
    id: "design-sobrancelha",
    name: "Design de Sobrancelhas",
    category: "cilios",
    description:
      "Mapeamento e design personalizado para harmonizar o olhar com o formato do seu rosto.",
    durationMin: 40,
    priceFrom: 45,
    popular: true,
    featured: true,
  },
  {
    id: "micropigmentacao-fio",
    name: "Micropigmentação Fio a Fio",
    category: "micropigmentacao",
    description:
      "Técnica delicada que preenche e define sobrancelhas com aspecto natural e duradouro.",
    durationMin: 120,
    priceFrom: 450,
    featured: true,
    popular: true,
  },
  {
    id: "micropigmentacao-shadow",
    name: "Micropigmentação Shadow",
    category: "micropigmentacao",
    description:
      "Efeito sombreado suave para sobrancelhas preenchidas com acabamento sofisticado.",
    durationMin: 120,
    priceFrom: 480,
  },
  {
    id: "alongamento-cilios",
    name: "Alongamento de Cílios",
    category: "cilios",
    description:
      "Volume e curvatura personalizados para um olhar marcado, sem perder a naturalidade.",
    durationMin: 90,
    priceFrom: 150,
    popular: true,
  },
  {
    id: "botox-facial",
    name: "Botox Facial",
    category: "facial",
    description:
      "Suavização de linhas de expressão com resultado natural e harmônico.",
    durationMin: 45,
    priceFrom: 650,
    featured: true,
  },
  {
    id: "limpeza-pele",
    name: "Limpeza de Pele Profunda",
    category: "facial",
    description:
      "Protocolo completo de limpeza, extração e hidratação para pele revitalizada.",
    durationMin: 75,
    priceFrom: 120,
    popular: true,
  },
  {
    id: "peeling",
    name: "Peeling Químico",
    category: "facial",
    description:
      "Renovação celular para uniformizar textura, manchas e luminosidade da pele.",
    durationMin: 60,
    priceFrom: 180,
  },
  {
    id: "luz-pulsada",
    name: "Luz Pulsada",
    category: "facial",
    description:
      "Tecnologia avançada para rejuvenescimento, manchas e estímulo de colágeno.",
    durationMin: 50,
    priceFrom: 220,
  },
  {
    id: "drenagem",
    name: "Drenagem Linfática",
    category: "corporal",
    description:
      "Massagem terapêutica que reduz inchaço, melhora circulação e promove bem-estar.",
    durationMin: 60,
    priceFrom: 130,
  },
  {
    id: "ventosaterapia",
    name: "Ventosaterapia",
    category: "corporal",
    description:
      "Técnica milenar aliada à estética avançada para alívio muscular e revitalização.",
    durationMin: 50,
    priceFrom: 100,
    featured: true,
  },
  {
    id: "acupuntura",
    name: "Acupuntura Estética",
    category: "corporal",
    description:
      "Equilíbrio corpo-mente com foco em saúde, autoestima e resultados estéticos.",
    durationMin: 60,
    priceFrom: 140,
  },
  {
    id: "depilacao-completa",
    name: "Depilação Completa",
    category: "depilacao",
    description:
      "Depilação com técnica cuidadosa para pele lisa, confortável e sem irritação.",
    durationMin: 60,
    priceFrom: 90,
    popular: true,
  },
  {
    id: "depilacao-facial",
    name: "Depilação Facial",
    category: "depilacao",
    description:
      "Remoção delicada de pelos faciais com atenção à sensibilidade da pele.",
    durationMin: 30,
    priceFrom: 40,
  },
  {
    id: "nail-design",
    name: "Nail Design Completo",
    category: "unhas",
    description:
      "Unhas transformadas com técnica, criatividade e acabamento impecável.",
    durationMin: 90,
    priceFrom: 80,
    featured: true,
    popular: true,
  },
  {
    id: "manicure",
    name: "Manicure Completa",
    category: "unhas",
    description:
      "Cuidado das mãos com delicadeza e atenção aos mínimos detalhes.",
    durationMin: 50,
    priceFrom: 45,
  },
  {
    id: "spa-maos",
    name: "Spa das Mãos",
    category: "unhas",
    description:
      "Experiência de hidratação e cuidado premium para mãos macias e elegantes.",
    durationMin: 40,
    priceFrom: 55,
  },
];

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

export function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}
