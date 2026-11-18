/**
 * MODELO: TriageModel
 * Motor de Triaje Semafórico y cálculo de edad corregida para prematurez
 */

function calculateExactAge(birthDateString, gestationWeeks = null) {
  const birth = new Date(birthDateString);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  const totalMonths = (years * 12) + months;
  
  let correctedMonths = totalMonths;
  let isPremature = false;
  if (gestationWeeks && gestationWeeks < 37 && totalMonths <= 24) {
    isPremature = true;
    const missingWeeks = 40 - gestationWeeks;
    const missingMonths = missingWeeks / 4.33;
    correctedMonths = Math.max(0, Math.round((totalMonths - missingMonths) * 10) / 10);
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    totalMonths: Math.max(0, totalMonths),
    correctedMonths,
    isPremature,
    isValid: totalMonths <= 144
  };
}

function runClinicalTriage(childAgeMonths, selectedAnswers) {
  let totalScore = 0;
  const redFlagsList = [];

  selectedAnswers.forEach(ans => {
    totalScore += ans.riskWeight;
    if (ans.isRedFlag) {
      redFlagsList.push({
        questionText: ans.questionText,
        answerText: ans.answerText,
        clinicalConcept: ans.clinicalConcept
      });
    }
  });

  const redFlagsCount = redFlagsList.length;

  if (redFlagsCount > 0 || totalScore >= 4) {
    return {
      riskLevel: 'Rojo',
      totalScore,
      redFlagsCount,
      redFlagsList,
      summaryTitle: 'Derivación Prioritaria a Kinesiología / Especialista',
      summaryMessage: 'Se han detectado signos biomecánicos que requieren ser valorados por un Kinesiólogo Pediátrico. Una intervención a tiempo previene compensaciones y asegura una marcha armónica.',
      suggestReferral: true
    };
  } else if (totalScore >= 2) {
    return {
      riskLevel: 'Amarillo',
      totalScore,
      redFlagsCount: 0,
      redFlagsList: [],
      summaryTitle: 'Marcha en Observación • Consulta Sugerida',
      summaryMessage: 'El patrón de marcha presenta características que conviene monitorear. Aunque no revisten peligro inmediato, una revisión preventiva con tele-kinesiología ayudará a guiar el calzado y estimulación.',
      suggestReferral: true
    };
  } else {
    return {
      riskLevel: 'Verde',
      totalScore,
      redFlagsCount: 0,
      redFlagsList: [],
      summaryTitle: 'Marcha Saludable y Esperable para la Edad',
      summaryMessage: '¡Excelente noticia! Los parámetros observados corresponden a la etapa natural de desarrollo motor de su hijo. Continúen fomentando el movimiento activo.',
      suggestReferral: false
    };
  }
}
