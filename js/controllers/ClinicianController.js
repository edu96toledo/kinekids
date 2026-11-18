/**
 * CONTROLADOR: ClinicianController
 * Filtros de bandeja, control de reproductor cuadro a cuadro (±0.033s), marcas de tiempo y dictamen oficial
 */

function filterCases(filterType) {
  windowActiveFilter = filterType;
  const allCases = window._allClinicalCases || [];
  let filtered = allCases;

  if (filterType === 'pending') {
    filtered = allCases.filter(c => c.status === 'EN_REVISION' || c.status === 'PENDIENTE_EVALUACION');
  } else if (filterType === 'responded') {
    filtered = allCases.filter(c => c.status === 'REVISADO_CON_RESPUESTA');
  } else if (filterType === 'presential') {
    filtered = allCases.filter(c => c.status === 'REQUIERE_PRESENCIAL');
  } else if (filterType === 'rojo') {
    filtered = allCases.filter(c => c.riskLevel === 'Rojo');
  } else if (filterType === 'amarillo') {
    filtered = allCases.filter(c => c.riskLevel === 'Amarillo');
  } else if (filterType === 'verde') {
    filtered = allCases.filter(c => c.riskLevel === 'Verde');
  }

  const buttons = ['all', 'pending', 'responded', 'presential', 'rojo', 'amarillo', 'verde'];
  buttons.forEach(btnId => {
    const el = document.getElementById(`filter-${btnId}`);
    if (!el) return;
    if (btnId === filterType) {
      el.className = "px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white transition-colors";
    } else {
      el.className = "px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors";
    }
  });

  const container = document.getElementById('cases-list-container');
  if (container) {
    container.innerHTML = renderCaseCards(filtered);
  }
}

function setVideoSpeed(speed) {
  const video = document.getElementById('clinical-video-player');
  if (video) {
    video.playbackRate = speed;
  }
  ['btn-speed-025', 'btn-speed-05', 'btn-speed-1'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = "px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors";
  });
  const activeId = speed === 0.25 ? 'btn-speed-025' : speed === 0.5 ? 'btn-speed-05' : 'btn-speed-1';
  const activeEl = document.getElementById(activeId);
  if (activeEl) activeEl.className = "px-2.5 py-1 bg-teal-600 text-white text-xs font-bold rounded-lg transition-colors";
}

function seekVideo(seconds) {
  const video = document.getElementById('clinical-video-player');
  if (video) {
    video.currentTime = Math.max(0, Math.min(video.duration || 9999, video.currentTime + seconds));
  }
}

function captureTimestamp() {
  const video = document.getElementById('clinical-video-player');
  const timestampBox = document.getElementById('video-timestamp-notes');
  const privateNotes = document.getElementById('verdict-private-note');
  if (!video) return;

  const t = video.currentTime;
  const mins = String(Math.floor(t / 60)).padStart(2, '0');
  const secs = String(Math.floor(t % 60)).padStart(2, '0');
  const marker = `[${mins}:${secs}] `;

  if (timestampBox) {
    timestampBox.value += (timestampBox.value ? '\n' : '') + marker;
    timestampBox.focus();
  }
  if (privateNotes) {
    privateNotes.value += (privateNotes.value ? '\n' : '') + marker;
  }
  showToast(`Segundo ${marker} capturado`, 'info');
}

function togglePresentialFields(show) {
  const box = document.getElementById('presential-fields-box');
  if (!box) return;
  if (show) {
    box.classList.remove('hidden');
  } else {
    box.classList.add('hidden');
  }
}

function handleSendOfficialVerdict(e, evalId) {
  e.preventDefault();
  const resolution = document.querySelector('input[name="verdict_resolution"]:checked')?.value || 'NORMAL';
  const message = document.getElementById('verdict-message')?.value.trim() || '';
  const homeTips = document.getElementById('verdict-home-tips')?.value.trim() || '';
  const clinicAddress = document.getElementById('verdict-clinic-address')?.value.trim() || '';
  const bookingUrl = document.getElementById('verdict-booking-url')?.value.trim() || '';
  const privateNote = document.getElementById('verdict-private-note')?.value.trim() || '';
  const timestampNotes = document.getElementById('video-timestamp-notes')?.value.trim() || '';

  const isPresential = resolution === 'REQUIERE_PRESENCIAL';
  const db = getDB();
  const cs = db.evaluations.find(el => el.id === evalId);

  if (!cs) return;

  cs.status = isPresential ? 'REQUIERE_PRESENCIAL' : 'REVISADO_CON_RESPUESTA';
  cs.referralStatus = 'Respondida';
  cs.notesClinician = privateNote + (timestampNotes ? ('\n\n[Marcas de Video]:\n' + timestampNotes) : '');
  cs.officialResponse = {
    id: Date.now(),
    clinicianId: currentUser.id,
    clinicianName: currentUser.name,
    clinicianSis: currentUser.sisRegister || 'SIS-Verificado',
    tipoResolucion: resolution,
    requiereConsultaPresencial: isPresential,
    mensajeOficialPadre: message,
    indicacionesDomiciliarias: homeTips,
    datosContactoAgenda: isPresential ? clinicAddress : null,
    bookingUrl: isPresential ? bookingUrl : null,
    fechaRespuesta: new Date().toISOString().split('T')[0]
  };

  saveDB(db);
  addAuditLog('DICTAMEN_OFICIAL', `Dictamen oficial emitido por ${currentUser.name} para ${cs.childName} (${resolution})`);
  closeModal();
  showToast('¡Dictamen oficial emitido y notificado a la familia!', 'success');
  renderClinicianCases(document.getElementById('app-content'));
}
