export type Professional = {
  id: string;
  name: string;
  role: string;
  bio: string[];
  image: string;
  specialties: string[];
  colorAccent?: string;
};

export const team: Professional[] = [
  {
    id: "yame",
    name: "Yamê",
    role: "Esteticista · Pós-graduada em Acupuntura",
    image: "/team/yame.jpg",
    specialties: ["Acupuntura", "Ventosaterapia", "Estética avançada"],
    bio: [
      "Especialista em tratamentos que unem saúde, equilíbrio e bem-estar.",
      "Combina a sabedoria da acupuntura com a estética avançada para resultados no corpo, na mente e na autoestima.",
    ],
  },
  {
    id: "ariany",
    name: "Ariany",
    role: "Nail Designer",
    image: "/team/ariany.jpg",
    specialties: ["Nail design", "Alongamento", "Arte nas unhas"],
    bio: [
      "Transforma ideias em unhas incríveis, unindo técnica, criatividade e atenção a cada detalhe.",
      "Proporciona uma experiência acolhedora e personalizada que realça beleza e confiança.",
    ],
  },
  {
    id: "luana",
    name: "Luana",
    role: "Manicure",
    image: "/team/luana.jpg",
    specialties: ["Manicure", "Cuidado das mãos", "Esmaltação"],
    bio: [
      "Especialista em beleza e cuidado das mãos. Com técnica apurada e delicadeza, transforma unhas em símbolos de autoestima.",
      "Apaixonada pelo que faz, oferece atendimento acolhedor e personalizado em cada visita.",
    ],
  },
  {
    id: "livia",
    name: "Lívia Sodré",
    role: "Fundadora · Estética Avançada",
    image: "/brand/logo.png",
    specialties: ["Micropigmentação", "Gestão clínica", "Atendimento premium"],
    bio: [
      "Criou um espaço onde beleza e bem-estar caminham juntas, com profissionais que realmente fazem a diferença.",
      "Cada atendimento é pensado para realçar o que já é naturalmente seu.",
    ],
  },
];
