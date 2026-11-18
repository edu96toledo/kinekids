/**
 * CONTROLADOR: EvaluationController
 * Gestión de cuestionario, carga multimedia (límite 50MB), consentimiento informado y derivación
 */

function handleSubmitEvaluation(e, childId, ageYears, ageMonths, totalMonths) {
  e.preventDefault();
  const db = getDB();
  const child = db.children.find(c => c.id === childId);
  const form = e.target;
  const inputs = form.querySelectorAll('input[type="radio"]:checked');

  const selectedAnswers = [];
  inputs.forEach(input => {
    selectedAnswers.push({
      questionText: input.getAttribute('data-qtext'),
      answerText: input.getAttribute('data-atext'),
      riskWeight: parseInt(input.getAttribute('data-risk') || '0', 10),
      clinicalConcept: input.getAttribute('data-clinical') || '',
      isRedFlag: input.getAttribute('data-redflag') === 'true'
    });
  });

  const triage = runClinicalTriage(totalMonths, selectedAnswers);

  const newEval = {
    id: Date.now(),
    childId: child.id,
    childName: child.name,
    date: new Date().toISOString().split('T')[0],
    childAgeYears: ageYears,
    childAgeMonths: ageMonths,
    childTotalMonths: totalMonths,
    riskLevel: triage.riskLevel,
    totalScore: triage.totalScore,
    redFlagsCount: triage.redFlagsCount,
    redFlagsList: triage.redFlagsList,
    answers: selectedAnswers,
    status: 'PENDIENTE_EVALUACION',
    referralStatus: triage.suggestReferral ? 'PendienteDerivacion' : 'NoRequerida',
    assignedClinicianId: null,
    assignedClinicianName: '',
    parentQuery: '',
    consentAccepted: false,
    consentTimestamp: null,
    media: [],
    officialResponse: null,
    notesClinician: ''
  };

  db.evaluations.unshift(newEval);
  saveDB(db);

  addAuditLog('EVALUACION_CREADA', `Cuestionario completado para ${child.name}. Triaje: ${triage.riskLevel} (${triage.totalScore} pts)`);
  showToast('Cuestionario guardado. Ahora puedes adjuntar evidencia visual.', 'success');
  navigateTo('parent-triage-result', { evalId: newEval.id });
}

function attachSampleMedia(evalId, sampleType) {
  const db = getDB();
  const ev = db.evaluations.find(e => e.id === evalId);
  if (!ev) return;
  if (!ev.media) ev.media = [];

  const photoCount = ev.media.filter(m => m.tipoArchivo === 'FOTO').length;
  const videoCount = ev.media.filter(m => m.tipoArchivo === 'VIDEO').length;

  if (sampleType === 'VIDEO') {
    if (videoCount >= 2) {
      showToast('Límite alcanzado: Máximo 2 videos por evaluación.', 'error');
      return;
    }
    ev.media.push({
      id: Date.now(),
      tipoArchivo: 'VIDEO',
      categoriaVista: 'SAGITAL',
      tituloDescriptivo: `Video de Marcha Sagital #${videoCount + 1}`,
      urlArchivo: SAMPLE_VIDEO_WALK,
      nombreArchivo: 'marcha_pediatrica_sagital.mp4',
      duracionSegundos: 15,
      tamanoBytes: 15400000
    });
    showToast('Video de marcha de prueba adjuntado', 'success');
  } else if (sampleType === 'FOTO_FEET') {
    if (photoCount >= 3) {
      showToast('Límite alcanzado: Máximo 3 fotos por evaluación.', 'error');
      return;
    }
    ev.media.push({
      id: Date.now(),
      tipoArchivo: 'FOTO',
      categoriaVista: 'POSTERIOR',
      tituloDescriptivo: 'Alineación de tobillos y rodillas',
      urlArchivo: SAMPLE_PHOTO_FEET,
      nombreArchivo: 'foto_alineacion_talon.jpg',
      tamanoBytes: 2100000
    });
    showToast('Foto de apoyo posterior adjuntada', 'success');
  }

  saveDB(db);
  renderTriageResultView(document.getElementById('app-content'), { evalId });
}

function handleRealFileUpload(event, evalId) {
  const file = event.target.files[0];
  if (!file) return;

  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (!isVideo && !isImage) {
    showToast('Formato no permitido. Solo se aceptan videos (.mp4, .mov, .webm) o fotos (.jpg, .png, .webp).', 'error');
    return;
  }

  // Restricción de 50MB (52,428,800 bytes)
  const MAX_BYTES = 50 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    showToast('El archivo supera el tamaño máximo permitido de 50 MB.', 'error');
    return;
  }

  const db = getDB();
  const ev = db.evaluations.find(e => e.id === evalId);
  if (!ev) return;
  if (!ev.media) ev.media = [];

  const photoCount = ev.media.filter(m => m.tipoArchivo === 'FOTO').length;
  const videoCount = ev.media.filter(m => m.tipoArchivo === 'VIDEO').length;

  if (isVideo && videoCount >= 2) {
    showToast('Límite alcanzado: Máximo 2 videos por evaluación.', 'error');
    return;
  }
  if (isImage && photoCount >= 3) {
    showToast('Límite alcanzado: Máximo 3 fotos por evaluación.', 'error');
    return;
  }

  const blobUrl = URL.createObjectURL(file);

  ev.media.push({
    id: Date.now(),
    tipoArchivo: isVideo ? 'VIDEO' : 'FOTO',
    categoriaVista: isVideo ? 'SAGITAL/FRONTAL' : 'ALINEACION',
    tituloDescriptivo: file.name,
    urlArchivo: blobUrl,
    nombreArchivo: file.name,
    tamanoBytes: file.size,
    duracionSegundos: isVideo ? 20 : null
  });

  saveDB(db);
  addAuditLog('SUBIDA_MULTIMEDIA', `Archivo "${file.name}" (${(file.size/1000000).toFixed(1)}MB) adjuntado a evaluación ID ${evalId}`);
  showToast(`Archivo "${file.name}" adjuntado con éxito`, 'success');
  renderTriageResultView(document.getElementById('app-content'), { evalId });
}

function removeMediaFromEval(evalId, mediaId) {
  const db = getDB();
  const ev = db.evaluations.find(e => e.id === evalId);
  if (ev && ev.media) {
    ev.media = ev.media.filter(m => m.id !== mediaId);
    saveDB(db);
    showToast('Archivo eliminado', 'info');
    renderTriageResultView(document.getElementById('app-content'), { evalId });
  }
}

function handleReferCase(e, evalId) {
  e.preventDefault();
  const consentCheckbox = document.getElementById('consent-checkbox');
  if (!consentCheckbox || !consentCheckbox.checked) {
    showToast('Debes aceptar el consentimiento informado de telemedicina para enviar la evaluación.', 'error');
    return;
  }

  const db = getDB();
  const ev = db.evaluations.find(el => el.id === evalId);
  if (!ev) return;

  const checkedClinician = document.querySelector('input[name="selected_clinician"]:checked');
  if (!checkedClinician) {
    showToast('Selecciona un kinesiólogo disponible.', 'error');
    return;
  }

  const clinicianId = parseInt(checkedClinician.value, 10);
  const clinicianName = checkedClinician.getAttribute('data-name');
  const query = document.getElementById('parent-query-text')?.value.trim() || '';

  ev.referralStatus = 'Derivada';
  ev.status = 'EN_REVISION';
  ev.assignedClinicianId = clinicianId;
  ev.assignedClinicianName = clinicianName;
  ev.parentQuery = query;
  ev.consentAccepted = true;
  ev.consentTimestamp = new Date().toISOString();

  saveDB(db);
  addAuditLog('DERIVACION_CASO', `Caso derivado a ${clinicianName} con consentimiento Ley 20.584 firmado por ${currentUser.name}`);
  showToast(`¡Ficha y videos derivados con éxito a ${clinicianName}!`, 'success');
  navigateTo('parent-triage-result', { evalId: ev.id });
}
