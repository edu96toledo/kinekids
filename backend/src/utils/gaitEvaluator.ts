/**
 * MOTOR DE EVALUACIÓN Y TRIAJE CLÍNICO DE MARCHA PEDIÁTRICA
 * Especialidad: Kinesiología Infantil y Biomecánica del Desarrollo
 */

export interface QuestionOption {
  id: number;
  text: string;               // Texto empático y claro para el padre
  clinicalConcept: string;     // Concepto biomecánico para el kinesiólogo
  riskWeight: number;          // 0 = Esperable, 1 = Observación/Leve, 2 = Alerta/Derivación
  isRedFlag?: boolean;         // Indicador de Bandera Roja
}

export interface GaitQuestion {
  id: number;
  category: string;
  text: string;
  subtitleHelp?: string;
  ageMinMonths: number;
  ageMaxMonths: number;
  options: QuestionOption[];
}

/**
 * BANCO DE PREGUNTAS ELOCUENTES Y CLARAS PARA PADRES (0 A 12 AÑOS / 144 MESES)
 */
export const CLINICAL_GAIT_QUESTIONS: GaitQuestion[] = [
  {
    id: 1,
    category: "Hito del Inicio de la Marcha",
    text: "¿A qué edad dio su hijo sus primeros pasos independientes sin necesidad de afirmarse?",
    subtitleHelp: "Considere el momento en que logró caminar de un lado a otro por sí solo/a sin ayuda de un adulto ni muebles.",
    ageMinMonths: 12,
    ageMaxMonths: 144,
    options: [
      {
        id: 101,
        text: "Entre los 11 y 15 meses de edad (Etapa habitual y esperable)",
        clinicalConcept: "Inicio de marcha en ventana fisiológica estándar",
        riskWeight: 0
      },
      {
        id: 102,
        text: "Antes de los 11 meses (Comenzó de forma temprana)",
        clinicalConcept: "Marcha precoz, vigilar tono postural y alineación",
        riskWeight: 0
      },
      {
        id: 103,
        text: "Entre los 16 y 18 meses (Un poco más tarde de lo habitual, pero caminó solo)",
        clinicalConcept: "Marcha en límite superior de ventana motora de normalidad",
        riskWeight: 1
      },
      {
        id: 104,
        text: "Después de los 18 meses de vida, o tiene más de 18 meses y aún no camina solo",
        clinicalConcept: "Retraso en adquisición de la marcha independiente",
        riskWeight: 2,
        isRedFlag: true
      }
    ]
  },
  {
    id: 2,
    category: "Forma de Apoyo al Caminar (Contacto Inicial)",
    text: "Cuando su hijo camina descalzo sobre un piso liso, ¿cómo toma contacto su pie con el suelo?",
    subtitleHelp: "Observe con atención los primeros milisegundos cuando el pie toca el suelo al avanzar.",
    ageMinMonths: 12,
    ageMaxMonths: 144,
    options: [
      {
        id: 201,
        text: "Primero apoya el talón y luego apoya el resto del pie suavemente hacia adelante",
        clinicalConcept: "Contacto inicial fisiológico en talón (Heel-strike)",
        riskWeight: 0
      },
      {
        id: 202,
        text: "Apoya toda la planta del pie de una sola vez como una palmada plana",
        clinicalConcept: "Apoyo plano inicial (Foot-flat), común en niños < 2 años; vigilar bóveda plantar",
        riskWeight: 1
      },
      {
        id: 203,
        text: "Camina casi siempre en puntas de pie (sin tocar el talón con el suelo)",
        clinicalConcept: "Marcha en antepié / puntas persistente (Posible acortamiento de sóleo o gastrocnemios)",
        riskWeight: 2,
        isRedFlag: true
      },
      {
        id: 204,
        text: "Pisa cargando visiblemente hacia el borde de afuera o hacia el borde de adentro",
        clinicalConcept: "Desbalance eversor/inversor de retropié (Pronación o supinación marcada)",
        riskWeight: 1
      }
    ]
  },
  {
    id: 3,
    category: "Separación de Pies y Equilibrio (Base de Sustentación)",
    text: "Al mirar a su hijo de frente mientras camina, ¿qué tan separados lleva sus pies?",
    subtitleHelp: "Los niños pequeños suelen abrir más los pies para no caerse mientras maduran su equilibrio.",
    ageMinMonths: 12,
    ageMaxMonths: 60,
    options: [
      {
        id: 301,
        text: "Lleva los pies alineados aproximadamente con el ancho de sus hombros",
        clinicalConcept: "Base de sustentación fisiológica equilibrada",
        riskWeight: 0
      },
      {
        id: 302,
        text: "Camina con los pies bastante abiertos y los brazos levantados para equilibrarse",
        clinicalConcept: "Base de sustentación amplia de guardia alta (Típico y normal en deambuladores tempranos)",
        riskWeight: 0
      },
      {
        id: 303,
        text: "Cruza un pie por delante del otro como caminando por una cuerda o choca sus rodillas/tobillos",
        clinicalConcept: "Marcha en tijera o aducción excesiva de miembros inferiores",
        riskWeight: 2,
        isRedFlag: true
      }
    ]
  },
  {
    id: 4,
    category: "Simetría del Paso y Presencia de Cojera (Claudicación)",
    text: "¿Ha notado si el niño renguea, cojea o pasa menos tiempo apoyado en una pierna que en la otra?",
    subtitleHelp: "Compare la fluidez y el tiempo de apoyo entre el lado derecho y el izquierdo.",
    ageMinMonths: 12,
    ageMaxMonths: 144,
    options: [
      {
        id: 401,
        text: "No, ambos pasos son parejos, tienen el mismo ritmo y duración de apoyo",
        clinicalConcept: "Simetría bilateral conservada de fases de apoyo y balanceo",
        riskWeight: 0
      },
      {
        id: 402,
        text: "A veces noto una ligera irregularidad cuando está muy cansado/a",
        clinicalConcept: "Asimetría leve o fatiga motora funcional",
        riskWeight: 1
      },
      {
        id: 403,
        text: "Sí, cojea de manera evidente, apoya muy rápido una pierna para no cargarla o arrastra un pie",
        clinicalConcept: "Claudicación antálgica o dismetría evidente (Signo de alarma inmediata)",
        riskWeight: 2,
        isRedFlag: true
      }
    ]
  },
  {
    id: 5,
    category: "Alineación de las Rodillas (En X o en Paréntesis)",
    text: "Estando el niño de pie descalzo mirando al frente, ¿cómo se posicionan sus rodillas y piernas?",
    subtitleHelp: "Tenga presente que las piernas arqueadas son normales antes de los 2 años, y juntas en X entre los 3 y 6 años.",
    ageMinMonths: 24,
    ageMaxMonths: 144,
    options: [
      {
        id: 501,
        text: "Piernas rectas y armónicas, con las rodillas y tobillos bien proporcionados",
        clinicalConcept: "Alineación angular en plano coronal dentro de norma",
        riskWeight: 0
      },
      {
        id: 502,
        text: "Las rodillas se tocan en el centro y los tobillos quedan separados ('rodillas en X')",
        clinicalConcept: "Genu Valgo fisiológico (habitual de 3 a 6 años; valorar distancia intermaleolar si es mayor a 6 años)",
        riskWeight: 1
      },
      {
        id: 503,
        text: "Las rodillas quedan muy separadas con los tobillos juntos ('piernas arqueadas o en paréntesis')",
        clinicalConcept: "Genu Varo residual o patológico si persiste después de los 2 años",
        riskWeight: 1
      },
      {
        id: 504,
        text: "Una rodilla está recta y la otra está visiblemente curvada o desalineada",
        clinicalConcept: "Asimetría angular unilateral (Requiere descarte de tibia vara de Blount o asimetría de extremidades)",
        riskWeight: 2,
        isRedFlag: true
      }
    ]
  },
  {
    id: 6,
    category: "Dirección de los Pies al Caminar (Hacia adentro o afuera)",
    text: "Al avanzar el paso, ¿hacia dónde apuntan los deditos de los pies del niño?",
    subtitleHelp: "Observe si la punta del pie mira hacia adelante, hacia adentro o hacia afuera.",
    ageMinMonths: 18,
    ageMaxMonths: 144,
    options: [
      {
        id: 601,
        text: "Apuntan hacia el frente o con una levísima inclinación hacia afuera (Posición natural)",
        clinicalConcept: "Ángulo de progresión del paso (Fick angle) fisiológico (5° a 15°)",
        riskWeight: 0
      },
      {
        id: 602,
        text: "Apuntan notablemente hacia adentro (como si los deditos quisieran mirarse)",
        clinicalConcept: "Marcha en aducción / In-toeing (Anteversión femoral o torsión tibial interna)",
        riskWeight: 1
      },
      {
        id: 603,
        text: "Apuntan muy hacia afuera (como 'marcha en pato')",
        clinicalConcept: "Marcha en abducción / Out-toeing (Retroversión femoral o torsión tibial externa)",
        riskWeight: 1
      }
    ]
  },
  {
    id: 7,
    category: "Tropiezos y Frecuencia de Caídas",
    text: "¿Con qué frecuencia tropieza o se cae el niño al caminar o correr en piso liso sin obstáculos?",
    subtitleHelp: "Diferencie las caídas por jugar distraído de caídas donde sus propios pies se traban.",
    ageMinMonths: 24,
    ageMaxMonths: 144,
    options: [
      {
        id: 701,
        text: "Rara vez se cae (lo habitual para su energía y juegos infantiles)",
        clinicalConcept: "Estabilidad postural y control motor adecuado",
        riskWeight: 0
      },
      {
        id: 702,
        text: "Se tropieza 1 o 2 veces al día cuando corre rápido o juega con entusiasmo",
        clinicalConcept: "Leve inmadurez de propiocepción o calzado no adaptado",
        riskWeight: 0
      },
      {
        id: 703,
        text: "Se tropieza frecuentemente con sus propios pies o le cuesta levantar la punta al avanzar",
        clinicalConcept: "Déficit de dorsiflexión en balanceo o incoordinación motora",
        riskWeight: 2,
        isRedFlag: true
      }
    ]
  },
  {
    id: 8,
    category: "Dolor, Cansancio Prematuro y Quejas",
    text: "¿El niño se queja de dolor en sus pies, tobillos, rodillas o pide que lo tomen en brazos muy rápido?",
    subtitleHelp: "Atienda a si rechaza caminar distancias normales para su edad o llora por dolor nocturno o al caminar.",
    ageMinMonths: 24,
    ageMaxMonths: 144,
    options: [
      {
        id: 801,
        text: "Nunca o casi nunca se queja; tiene energía y camina sin manifestar dolor",
        clinicalConcept: "Marcha asintomática con tolerancia adecuada a la carga",
        riskWeight: 0
      },
      {
        id: 802,
        text: "A veces manifiesta cansancio después de caminatas largas o paseos extensos",
        clinicalConcept: "Fatiga fisiológica acorde a capacidad muscular en desarrollo",
        riskWeight: 0
      },
      {
        id: 803,
        text: "Frecuentemente pide brazos a los pocos minutos de caminar porque le 'duelen los pies o rodillas'",
        clinicalConcept: "Sobrecarga biomecánica, pie plano doloroso o fatiga prematura",
        riskWeight: 1
      },
      {
        id: 804,
        text: "Llora de dolor evidente al apoyar el pie o se despierta con dolor articular intenso",
        clinicalConcept: "Dolor osteomuscular inflamatorio o mecánico agudo (Bandera roja obligatoria)",
        riskWeight: 2,
        isRedFlag: true
      }
    ]
  },
  {
    id: 9,
    category: "Rigidez y Facilidad de Movimiento",
    text: "Al levantarse por la mañana o después de estar sentado un rato, ¿cómo reacciona al comenzar a caminar?",
    subtitleHelp: "Observe si el niño se levanta ágilmente o si camina rígido como un robot los primeros minutos.",
    ageMinMonths: 24,
    ageMaxMonths: 144,
    options: [
      {
        id: 901,
        text: "Se para y camina de forma ágil y natural de inmediato",
        clinicalConcept: "Movilidad articular libre sin rigidez matutina",
        riskWeight: 0
      },
      {
        id: 902,
        text: "Le toma 1 o 2 minutos 'despertar las piernas', pero luego corre y camina con soltura",
        clinicalConcept: "Adaptación postural transitoria sin trascendencia clínica",
        riskWeight: 0
      },
      {
        id: 903,
        text: "Camina muy tieso, rígido o con dificultad evidente durante varios minutos tras reposar",
        clinicalConcept: "Rigidez articular prolongada (Signo para descartar afecciones reumatológicas o hipertonía)",
        riskWeight: 2,
        isRedFlag: true
      }
    ]
  },
  {
    id: 10,
    category: "Desgaste del Calzado",
    text: "Al mirar la suela de las zapatillas que más usa el niño, ¿cómo se aprecia el desgaste?",
    subtitleHelp: "Mire la suela desde atrás puesta sobre una mesa plana.",
    ageMinMonths: 36,
    ageMaxMonths: 144,
    options: [
      {
        id: 1001,
        text: "El desgaste es bastante parejo o ligeramente mayor en la parte trasera exterior",
        clinicalConcept: "Patrón de desgaste simétrico acorde a ciclo de marcha",
        riskWeight: 0
      },
      {
        id: 1002,
        text: "La suela está muy gastada y deformada hacia el lado de adentro (el zapato se ve caído hacia adentro)",
        clinicalConcept: "Pronación acentuada del retropié con colapso del arco longitudinal medial",
        riskWeight: 1
      },
      {
        id: 1003,
        text: "Un solo zapato está muy gastado y deformado mientras que el otro está casi nuevo",
        clinicalConcept: "Asimetría de carga unilateral evidente",
        riskWeight: 2,
        isRedFlag: true
      }
    ]
  }
];

/**
 * PLANTILLAS DE RESPUESTA RÁPIDA PARA EL KINESIÓLOGO
 */
export const CLINICIAN_RESPONSE_TEMPLATES = [
  {
    id: "presential_eval",
    title: "1. Solicitar Evaluación Presencial Prioritaria",
    badge: "Evaluación en Box",
    text: "Estimados padres: Al revisar las respuestas observo signos que ameritan una evaluación biomecánica presencial (valoración de rango articular, fuerza muscular y análisis visual de la marcha en pasillo). Les sugiero agendar una sesión de kinesiología infantil para explorar a fondo el caso y entregarles pautas terapéuticas oportunas."
  },
  {
    id: "home_exercises",
    title: "2. Indicar Pautas y Ejercicios en Casa",
    badge: "Pautas en Hogar",
    text: "Estimada familia: Los hallazgos descritos son de carácter leve. Sugiero iniciar en casa actividades lúdicas de estimulación descalzo sobre superficies variadas (césped, arena, alfombras), ejercicios de juego en cuclillas y masajes suaves en la planta de los pies. Si en un plazo de 6 semanas no notan mejoría o aparece dolor, coordinaremos una sesión presencial."
  },
  {
    id: "medical_referral",
    title: "3. Derivación Sugerida a Traumatología / Pediatría",
    badge: "Derivación Médica",
    text: "Estimados padres: Debido a la presencia de banderas rojas reportadas (como asimetría marcada, dolor o rigidez), es fundamental contar primero con la valoración de un Traumatólogo Infantil o Pediatra para descartar causas anatómicas u óseas antes de iniciar tratamiento kinésico. Por favor consulten con su médico de cabecera a la brevedad."
  },
  {
    id: "normal_followup",
    title: "4. Desarrollo Esperable para la Edad (Control en 3 Meses)",
    badge: "Control Preventivo",
    text: "Hola: Los patrones descritos por ustedes forman parte de la etapa normal de maduración neuromuscular para la edad del niño. Recomiendo continuar con calzado flexible de suela plana y permitir juego libre al aire libre. Realicen una nueva autoevaluación en la plataforma en 3 a 6 meses para monitorear su evolución natural."
  }
];

/**
 * MOTOR DE TRIAJE CLÍNICO (SEMÁFORO CLÍNICO)
 */
export interface EvaluationResult {
  riskLevel: "Verde" | "Amarillo" | "Rojo";
  totalScore: number;
  redFlagsCount: number;
  redFlagsList: { questionText: string; answerText: string; clinicalConcept: string }[];
  summaryTitle: string;
  summaryMessage: string;
  recommendations: string[];
  suggestReferral: boolean;
}

export function evaluateGaitAnswers(
  childAgeMonths: number,
  answers: { questionId: number; optionId: number }[]
): EvaluationResult {
  let totalScore = 0;
  const redFlagsList: { questionText: string; answerText: string; clinicalConcept: string }[] = [];

  answers.forEach((ans) => {
    const question = CLINICAL_GAIT_QUESTIONS.find((q) => q.id === ans.questionId);
    if (!question) return;

    const option = question.options.find((o) => o.id === ans.optionId);
    if (!option) return;

    totalScore += option.riskWeight;

    // Detectar Bandera Roja
    let isRed = option.isRedFlag || false;

    // Regla especial de edad: La marcha en puntas (pregunta 2, opción 203) es bandera roja estricta si el niño tiene más de 36 meses (3 años)
    if (question.id === 2 && option.id === 203 && childAgeMonths < 36) {
      // En menores de 3 años la marcha en puntas idiopática intermitente puede ser exploratoria
      // Se pondera como observación leve a menos que sea persistente
    }

    if (isRed) {
      redFlagsList.push({
        questionText: question.text,
        answerText: option.text,
        clinicalConcept: option.clinicalConcept
      });
    }
  });

  const redFlagsCount = redFlagsList.length;

  // LÓGICA DEL SEMÁFORO CLÍNICO
  if (redFlagsCount > 0 || totalScore >= 4) {
    return {
      riskLevel: "Rojo",
      totalScore,
      redFlagsCount,
      redFlagsList,
      summaryTitle: "Derivación Prioritaria Sugerida a Especialista",
      summaryMessage:
        "Se han identificado uno o más signos clínicos (banderas rojas) que requieren ser examinados por un Kinesiólogo Pediátrico o Traumatólogo Infantil para asegurar una intervención oportuna y prevenir compensaciones en el crecimiento.",
      recommendations: [
        "Agendar una consulta con un kinesiólogo infantil de la app para análisis detallado.",
        "Evitar forzar al niño a caminar o correr si manifiesta dolor o llanto.",
        "Grabar un video de 15 a 30 segundos del niño caminando descalzo en línea recta para mostrárselo al profesional."
      ],
      suggestReferral: true
    };
  } else if (totalScore >= 2) {
    return {
      riskLevel: "Amarillo",
      totalScore,
      redFlagsCount: 0,
      redFlagsList: [],
      summaryTitle: "Requiere Observación y Consulta Preventiva Sugerida",
      summaryMessage:
        "El patrón de marcha presenta características que vale la pena monitorear. Aunque no se detectaron signos de alarma inmediata, una revisión preventiva con un kinesiólogo ayudará a optimizar el calzado, postura y desarrollo motor del niño.",
      recommendations: [
        "Monitorear la evolución durante las próximas 4 a 6 semanas.",
        "Utilizar calzado respetuoso: suela plana, flexible en metatarsos y sin tacones.",
        "Puedes derivar esta ficha a un kinesiólogo de la plataforma para recibir pautas específicas en el hogar."
      ],
      suggestReferral: true
    };
  } else {
    return {
      riskLevel: "Verde",
      totalScore,
      redFlagsCount: 0,
      redFlagsList: [],
      summaryTitle: "Marcha Esperable y Saludable para la Edad",
      summaryMessage:
        "¡Excelentes noticias! Los parámetros observados corresponden al desarrollo biomecánico y neuromuscular esperable para los años y meses de su hijo. Continúe fomentando el juego activo y libre.",
      recommendations: [
        "Fomentar el juego descalzo en superficies seguras (pasto, alfombras, tierra blanda) para fortalecer la musculatura plantar.",
        "Evitar el uso de andadores o calzado rígido pesado que limite el movimiento natural del tobillo.",
        "Realizar una nueva autoevaluación preventiva cada 6 meses o ante cualquier cambio de conducta motriz."
      ],
      suggestReferral: false
    };
  }
}
