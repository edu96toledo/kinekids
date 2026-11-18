/**
 * MODELO: DatabaseModel
 * Gestión de persistencia local (localStorage), datos maestros y sesiones de usuario
 */

const STORAGE_KEY = 'KINEKIDS_DATABASE_V5_HEALTH';
const SESSION_KEY = 'KINEKIDS_ACTIVE_SESSION';
const DEFAULT_PASS = '123456789';

const SAMPLE_VIDEO_WALK = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
const SAMPLE_PHOTO_FEET = "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop&q=80";
const SAMPLE_PHOTO_SHOES = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80";

const defaultDatabase = {
  users: [
    {
      id: 1,
      name: 'Super Administrador',
      rut: '192019204',
      email: 'toledoordenes1920@gmail.com',
      password: DEFAULT_PASS,
      role: 'SUPER_ADMIN',
      status: 'activo'
    },
    {
      id: 2,
      name: 'Dr. Matías Silva',
      rut: '18456123K',
      email: 'msilva@clinica.cl',
      password: DEFAULT_PASS,
      role: 'Clinician',
      status: 'activo',
      sisRegister: '128456',
      specialty: 'Kinesiología Pediátrica & Biomecánica de la Marcha',
      phone: '+56 9 8765 4321',
      clinicAddress: 'Centro Médico Los Alerces, Av. Providencia 1240, Consulta 402, Santiago',
      clinicBookingUrl: 'https://wa.me/56987654321?text=Hola%20Dr.%20Matias%20solicito%20hora%20presencial%20KineKids'
    },
    {
      id: 4,
      name: 'Dra. Valentina Muñoz',
      rut: '176543219',
      email: 'vmunoz@kinekids.cl',
      password: DEFAULT_PASS,
      role: 'Clinician',
      status: 'activo',
      sisRegister: '145920',
      specialty: 'Neurokinesiología Infantil y Tono Postural',
      phone: '+56 9 7654 3210',
      clinicAddress: 'Clínica Infantil San Cristóbal, Box 14, Las Condes',
      clinicBookingUrl: 'https://wa.me/56976543210'
    },
    {
      id: 3,
      name: 'Carolina Toledo (Madre)',
      rut: '178904562',
      email: 'carolina@gmail.com',
      password: DEFAULT_PASS,
      role: 'Parent',
      status: 'activo'
    }
  ],
  children: [
    {
      id: 101,
      parentId: 3,
      name: 'Lucas Valenzuela',
      birthDate: '2024-03-15',
      gender: 'Masculino',
      gestationWeeks: 39,
      walkStartMonths: 13,
      weightKg: 13.5,
      heightCm: 91,
      medicalHistory: 'Sin antecedentes perinatales patológicos. Vacunas al día.'
    },
    {
      id: 102,
      parentId: 3,
      name: 'Sofía Valenzuela',
      birthDate: '2019-06-20',
      gender: 'Femenino',
      gestationWeeks: 36,
      walkStartMonths: 15,
      weightKg: 22.0,
      heightCm: 118,
      medicalHistory: 'Prematura tardía (36 semanas). Displasia leve de cadera en lactancia ya resuelta.'
    }
  ],
  questions: CLINICAL_GAIT_QUESTIONS,
  evaluations: [
    {
      id: 1001,
      childId: 101,
      childName: 'Lucas Valenzuela',
      date: '2026-11-10',
      childAgeYears: 2,
      childAgeMonths: 8,
      childTotalMonths: 32,
      riskLevel: 'Rojo',
      totalScore: 5,
      redFlagsCount: 1,
      status: 'REQUIERE_PRESENCIAL',
      referralStatus: 'Respondida',
      assignedClinicianId: 2,
      assignedClinicianName: 'Dr. Matías Silva',
      parentQuery: 'Hola doctor, Lucas camina mucho en puntitas sobre todo cuando está descalzo en casa y nos preocupa que no apoye los talones.',
      consentAccepted: true,
      consentTimestamp: '2026-11-10T14:30:00.000Z',
      redFlagsList: [
        {
          questionText: 'Cuando su hijo camina descalzo sobre un piso liso, ¿cómo toma contacto su pie con el suelo?',
          answerText: 'Camina casi siempre en puntas de pie (sin apoyar nunca el talón en el suelo)',
          clinicalConcept: 'Marcha en antepié / puntas persistente (Acortamiento de tríceps sural)'
        }
      ],
      answers: [
        { questionText: '¿A qué edad comenzó a caminar de forma independiente?', answerText: 'Entre los 11 y 15 meses de edad (Etapa habitual y esperable)', riskWeight: 0 },
        { questionText: 'Cuando su hijo camina descalzo sobre un piso liso, ¿cómo toma contacto su pie con el suelo?', answerText: 'Camina casi siempre en puntas de pie (sin apoyar nunca el talón en el suelo)', riskWeight: 2, isRedFlag: true },
        { questionText: 'Al mirar a su hijo de frente mientras camina, ¿qué tan separados lleva sus pies?', answerText: 'Camina con los pies bastante abiertos y los brazos levantados para equilibrarse', riskWeight: 0 }
      ],
      media: [
        {
          id: 501,
          tipoArchivo: 'VIDEO',
          categoriaVista: 'FRENTE',
          tituloDescriptivo: 'Video Marcha descalzo en pasillo',
          urlArchivo: SAMPLE_VIDEO_WALK,
          nombreArchivo: 'marcha_lucas_pasillo.mp4',
          duracionSegundos: 15,
          tamanoBytes: 12400000
        },
        {
          id: 502,
          tipoArchivo: 'FOTO',
          categoriaVista: 'POSTERIOR',
          tituloDescriptivo: 'Alineación de talones y tobillos de pie',
          urlArchivo: SAMPLE_PHOTO_FEET,
          nombreArchivo: 'foto_tobillos_posterior.jpg',
          tamanoBytes: 2450000
        }
      ],
      officialResponse: {
        id: 901,
        clinicianId: 2,
        clinicianName: 'Dr. Matías Silva',
        tipoResolucion: 'REQUIERE_PRESENCIAL',
        requiereConsultaPresencial: true,
        mensajeOficialPadre: 'Estimada Carolina: Luego de revisar el cuestionario y reproducir el video en cámara lenta, se evidencia un apoyo exclusivo en antepié sin contacto inicial de talón. Debido a que Lucas ya tiene 2 años y 8 meses y este patrón persiste descalzo, es indispensable realizar una evaluación física presencial en box para descartar retracción del tendón de Aquiles y evaluar el rango pasivo de dorsiflexión de tobillo.',
        indicacionesDomiciliarias: 'Mientras asisten a la consulta: Permitir que juegue en cuclillas para favorecer la dorsiflexión pasiva. No forzarlo ni regañarlo por caminar en puntas.',
        datosContactoAgenda: 'Centro Médico Los Alerces, Av. Providencia 1240, Consulta 402, Santiago • Horario Pediátrico: Martes y Jueves 09:00 a 18:00 hrs.',
        bookingUrl: 'https://wa.me/56987654321?text=Hola%20Dr.%20Matias%20solicito%20hora%20presencial%20para%20Lucas%20Valenzuela',
        fechaRespuesta: '2026-11-12'
      },
      notesClinician: '[00:04] Apoyo exclusivo en antepié bilateral. [00:08] Ausencia de contacto de talón en choque inicial. Sospecha de acortamiento miofascial de gastrocnemios vs marcha idiopática en puntas. Test de Silfverskiöld requerido en box.'
    }
  ],
  auditLog: [
    {
      id: 1,
      timestamp: '2026-11-10T14:35:00.000Z',
      userId: 3,
      userName: 'Carolina Toledo (Madre)',
      action: 'EVALUACION_ENVIADA',
      description: 'Evaluación y consentimiento informado enviado para Lucas Valenzuela (Semáforo Rojo)'
    },
    {
      id: 2,
      timestamp: '2026-11-12T10:15:00.000Z',
      userId: 2,
      userName: 'Dr. Matías Silva',
      action: 'DICTAMEN_OFICIAL',
      description: 'Dictamen oficial emitido para Lucas Valenzuela: Requiere Consulta Presencial'
    }
  ]
};

function getDB() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase));
    return defaultDatabase;
  }
  try {
    const parsed = JSON.parse(data);
    if (!parsed.auditLog) parsed.auditLog = defaultDatabase.auditLog;
    return parsed;
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase));
    return defaultDatabase;
  }
}

function saveDB(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getActiveSession() {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

function setActiveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearActiveSession() {
  localStorage.removeItem(SESSION_KEY);
}
