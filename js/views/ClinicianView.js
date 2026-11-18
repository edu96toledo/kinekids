/**
 * VISTA: ClinicianView
 * Panel de telemedicina kinesiológica, bandeja de casos y visor biomecánico cuadro a cuadro
 */

function renderClinicianCases(container) {
  const db = getDB();
  const myCases = db.evaluations.filter(e => e.assignedClinicianId === currentUser.id || !e.assignedClinicianId);
  window._allClinicalCases = myCases;

  container.innerHTML = `
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center space-x-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
          <i class="fa-solid fa-stethoscope"></i>
          <span>Panel de Telemedicina & Análisis Biomecánico</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Casos Derivados y Visor Clínico Multimedia</h2>
        <p class="text-sm text-slate-500 mt-1">Reproductor cuadro a cuadro (±0.033s), marcas de tiempo y dictámenes oficiales.</p>
      </div>
    </div>

    <!-- Barra de Filtrado Rápido -->
    <div class="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm items-center">
      <span class="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider"><i class="fa-solid fa-filter mr-1"></i> Filtrar:</span>
      
      <button onclick="filterCases('all')" id="filter-all" class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white transition-colors">
        Todos (${myCases.length})
      </button>
      <button onclick="filterCases('pending')" id="filter-pending" class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
        Pendientes
      </button>
      <button onclick="filterCases('responded')" id="filter-responded" class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
        Dictaminados
      </button>
      <button onclick="filterCases('presential')" id="filter-presential" class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
        Requiere Presencial
      </button>
      
      <div class="w-px h-5 bg-slate-200 mx-1"></div>

      <button onclick="filterCases('rojo')" id="filter-rojo" class="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors">
        🔴 Rojo
      </button>
      <button onclick="filterCases('amarillo')" id="filter-amarillo" class="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors">
        🟡 Amarillo
      </button>
      <button onclick="filterCases('verde')" id="filter-verde" class="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
        🟢 Verde
      </button>
    </div>

    <div id="cases-list-container">
      ${renderCaseCards(myCases)}
    </div>
  `;
}

function renderCaseCards(cases) {
  if (!cases || cases.length === 0) {
    return `
      <div class="text-center py-16 bg-white rounded-3xl border border-slate-200">
        <i class="fa-solid fa-inbox text-5xl text-slate-300 mb-3 block"></i>
        <h3 class="text-base font-bold text-slate-700">No se encontraron casos con este filtro</h3>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${cases.map(cs => {
        const hasMedia = cs.media && cs.media.length > 0;
        return `
          <div class="bg-white rounded-3xl p-6 border ${cs.status === 'REQUIERE_PRESENCIAL' ? 'border-rose-300' : 'border-slate-200'} shadow-sm hover:shadow-md transition-shadow">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-lg font-black text-slate-900">${cs.childName}</h3>
                  <span class="text-xs px-3 py-0.5 rounded-full font-bold ${cs.riskLevel === 'Rojo' ? 'bg-rose-100 text-rose-800' : cs.riskLevel === 'Amarillo' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
                    Semáforo: ${cs.riskLevel} (${cs.totalScore} pts)
                  </span>
                  <span class="text-xs px-2.5 py-0.5 rounded-full font-bold ${cs.status === 'REQUIERE_PRESENCIAL' ? 'bg-rose-600 text-white' : cs.status === 'REVISADO_CON_RESPUESTA' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}">
                    ${cs.status === 'REQUIERE_PRESENCIAL' ? 'Requiere Presencial' : cs.status === 'REVISADO_CON_RESPUESTA' ? 'Dictamen Emitido' : 'Pendiente de Dictamen'}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1">
                  Edad: <b>${cs.childAgeYears} años, ${cs.childAgeMonths} meses</b> • Fecha: ${cs.date} • ${hasMedia ? `<span class="text-teal-700 font-bold"><i class="fa-solid fa-video mr-1"></i> ${cs.media.length} archivos multimedia</span>` : '<span class="text-slate-400">Sin videos adjuntos</span>'}
                </p>
              </div>

              <div class="flex items-center space-x-2">
                ${cs.officialResponse ? `
                  <button onclick="printOfficialReport(${cs.id})" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center">
                    <i class="fa-solid fa-print mr-1.5"></i> PDF
                  </button>
                ` : ''}
                <button onclick="openClinicalAnalyzerModal(${cs.id})" class="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-teal-500/20 flex items-center">
                  <i class="fa-solid fa-play mr-1.5"></i> Abrir Visor y Dictaminar
                </button>
              </div>
            </div>

            ${cs.parentQuery ? `
              <div class="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-950">
                <span class="font-bold flex items-center mb-0.5"><i class="fa-solid fa-comment-dots mr-1.5 text-blue-600"></i> Consulta del padre:</span>
                <p class="italic">"${cs.parentQuery}"</p>
              </div>
            ` : ''}

            ${cs.consentAccepted ? `
              <div class="mt-2 text-[10px] text-emerald-700 font-semibold flex items-center">
                <i class="fa-solid fa-file-contract mr-1"></i> Consentimiento informado Ley 20.584 aceptado (${new Date(cs.consentTimestamp).toLocaleDateString('es-CL')})
              </div>
            ` : ''}

            ${cs.officialResponse ? `
              <div class="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
                <span class="font-bold text-slate-900 block mb-1"><i class="fa-solid fa-file-signature text-teal-600 mr-1"></i> Dictamen actual enviado:</span>
                <p>${cs.officialResponse.mensajeOficialPadre}</p>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function openClinicalAnalyzerModal(evalId) {
  const db = getDB();
  const cs = db.evaluations.find(e => e.id === evalId);
  if (!cs) return;

  const modal = document.getElementById('modal-container');
  const card = document.getElementById('modal-card');
  if (!modal || !card) return;

  const mediaList = cs.media || [];
  const videos = mediaList.filter(m => m.tipoArchivo === 'VIDEO');
  const photos = mediaList.filter(m => m.tipoArchivo === 'FOTO');
  const currentVideoUrl = videos.length > 0 ? videos[0].urlArchivo : null;

  card.innerHTML = `
    <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
      <div>
        <h3 class="text-lg font-black text-slate-900">Visor de Marcha & Dictamen Oficial</h3>
        <p class="text-xs text-slate-500">Paciente: <b>${cs.childName}</b> (${cs.childAgeYears}a, ${cs.childAgeMonths}m) • Semáforo: ${cs.riskLevel} (${cs.totalScore} pts)</p>
      </div>
      <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>

    <div class="space-y-6 text-sm">
      
      <!-- REPRODUCTOR DE VIDEO CLÍNICO CON CÁMARA LENTA Y CUADRO A CUADRO -->
      <div class="bg-slate-950 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center">
            <i class="fa-solid fa-video mr-1.5"></i> Reproductor Biomecánico Cuadro a Cuadro
          </span>
          <span class="text-[11px] text-slate-400">Paso fino de ±0.033s para analizar choque de talón</span>
        </div>

        ${currentVideoUrl ? `
          <div class="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
            <video id="clinical-video-player" src="${currentVideoUrl}" controls class="w-full h-full object-contain"></video>
          </div>

          <!-- CONTROLES AVANZADOS DE VELOCIDAD Y CUADRO A CUADRO -->
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-bold text-slate-400 mr-1">Velocidad:</span>
              <button type="button" onclick="setVideoSpeed(0.25)" id="btn-speed-025" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors">
                0.25x
              </button>
              <button type="button" onclick="setVideoSpeed(0.5)" id="btn-speed-05" class="px-2.5 py-1 bg-teal-600 text-white text-xs font-bold rounded-lg transition-colors">
                0.5x
              </button>
              <button type="button" onclick="setVideoSpeed(1.0)" id="btn-speed-1" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors">
                1.0x
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold text-slate-400 mr-1">Paso Fino:</span>
              <button type="button" onclick="seekVideo(-0.033)" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors" title="Retroceder 1 frame">
                <i class="fa-solid fa-backward-step mr-1"></i> -1 Frame
              </button>
              <button type="button" onclick="seekVideo(0.033)" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors" title="Avanzar 1 frame">
                +1 Frame <i class="fa-solid fa-forward-step ml-1"></i>
              </button>
            </div>
          </div>

          <!-- OBSERVACIONES CON MARCA DE TIEMPO -->
          <div class="mt-4 pt-3 border-t border-slate-800">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center">
                <i class="fa-solid fa-stopwatch mr-1.5"></i> Observaciones con Marca de Tiempo
              </span>
              <button type="button" onclick="captureTimestamp()" class="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                <i class="fa-solid fa-crosshairs mr-1"></i> Capturar segundo actual
              </button>
            </div>
            <textarea id="video-timestamp-notes" rows="2" placeholder="Haz clic en 'Capturar segundo actual' mientras reproduces el video para marcar momentos clave (ej: [00:04] Apoyo en antepié)..." 
                      class="w-full p-2.5 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-400"></textarea>
          </div>
        ` : `
          <div class="py-8 text-center text-slate-400 text-xs">
            <i class="fa-solid fa-video-slash text-3xl mb-2 block"></i>
            El padre no adjuntó videos en esta evaluación.
          </div>
        `}

        <!-- Galería de Fotos del Caso -->
        ${photos.length > 0 ? `
          <div class="mt-4 pt-3 border-t border-slate-800">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Fotos Adjuntas:</span>
            <div class="flex space-x-3 overflow-x-auto pb-1">
              ${photos.map(p => `
                <div class="relative rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 w-28 h-24 bg-slate-800">
                  <img src="${p.urlArchivo}" alt="${p.tituloDescriptivo}" class="w-full h-full object-cover">
                  <span class="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white p-1 truncate block">${p.categoriaVista}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- FORMULARIO DE DICTAMEN OFICIAL -->
      <form onsubmit="handleSendOfficialVerdict(event, ${cs.id})" class="space-y-4">
        <div>
          <span class="text-xs font-black uppercase tracking-wider text-teal-700 block mb-2">
            Emisión de Resolución Clínica Oficial
          </span>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label class="p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
              <input type="radio" name="verdict_resolution" value="NORMAL" onchange="togglePresentialFields(false)" required class="text-emerald-600 focus:ring-emerald-500">
              <span class="text-xs font-bold text-slate-800 block mt-1">1. Marcha Normal</span>
              <span class="text-[10px] text-slate-500 block leading-tight">Desarrollo motor fisiológico. Consejos en casa.</span>
            </label>

            <label class="p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50/50">
              <input type="radio" name="verdict_resolution" value="OBSERVACION_TELE" onchange="togglePresentialFields(false)" required class="text-amber-600 focus:ring-amber-500">
              <span class="text-xs font-bold text-slate-800 block mt-1">2. Control Tele-kinésico</span>
              <span class="text-[10px] text-slate-500 block leading-tight">Pautas de elongación y reevaluación en 3 meses.</span>
            </label>

            <label class="p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50/50">
              <input type="radio" name="verdict_resolution" value="REQUIERE_PRESENCIAL" onchange="togglePresentialFields(true)" checked required class="text-rose-600 focus:ring-rose-500">
              <span class="text-xs font-bold text-rose-700 block mt-1">3. Consulta Presencial</span>
              <span class="text-[10px] text-rose-600 block leading-tight">Examen físico en box clínico obligatorio/sugerido.</span>
            </label>
          </div>
        </div>

        <!-- Mensaje Oficial para la Familia -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Dictamen Oficial para el Padre / Madre (Lenguaje claro y empático):
          </label>
          <textarea id="verdict-message" rows="3" required placeholder="Escriba el informe claro para los padres explicando lo observado en el video..." 
                    class="w-full p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs">${cs.officialResponse ? cs.officialResponse.mensajeOficialPadre : 'Estimada familia: Tras analizar el cuestionario y el video de marcha en cámara lenta, se observa un patrón que requiere evaluación presencial en box para valorar la longitud muscular y articulaciones.'}</textarea>
        </div>

        <!-- Pautas en Hogar -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Indicaciones Preventivas en el Hogar:
          </label>
          <textarea id="verdict-home-tips" rows="2" placeholder="Ej: Juego descalzo en alfombra, sentadillas en juego..." 
                    class="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs">${cs.officialResponse ? cs.officialResponse.indicacionesDomiciliarias || '' : 'Fomentar juego libre descalzo y no forzar postura con calzado duro.'}</textarea>
        </div>

        <!-- Campos Condicionales de Consulta Presencial -->
        <div id="presential-fields-box" class="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-3">
          <span class="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center">
            <i class="fa-solid fa-hospital-user mr-1.5 text-rose-600"></i> Datos de Citación a Consulta Presencial
          </span>
          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Dirección de la Consulta / Box Kinésico:</label>
            <input type="text" id="verdict-clinic-address" value="${currentUser.clinicAddress || 'Centro Médico Los Alerces, Av. Providencia 1240, Consulta 402, Santiago'}" 
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-0.5">Enlace de Agenda / WhatsApp:</label>
            <input type="text" id="verdict-booking-url" value="${currentUser.clinicBookingUrl || 'https://wa.me/56987654321?text=Hola%20Dr.%20Matias%20solicito%20hora%20presencial'}" 
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none">
          </div>
        </div>

        <!-- Nota Interna Privada con Marcas de Tiempo -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <i class="fa-solid fa-lock text-xs mr-1"></i> Nota Clínica Interna Privada (Incluye marcas de tiempo, invisible para el padre)
          </label>
          <textarea id="verdict-private-note" rows="2" placeholder="Diagnóstico presuntivo, signos a testear en box..." 
                    class="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 focus:outline-none">${cs.notesClinician || ''}</textarea>
        </div>

        <div class="mt-6 flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button type="button" onclick="closeModal()" class="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
          <button type="submit" class="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-2xl text-xs shadow-md">
            Emitir Dictamen Oficial al Padre
          </button>
        </div>
      </form>

    </div>
  `;
  modal.classList.remove('hidden');

  setTimeout(() => {
    setVideoSpeed(0.5);
  }, 100);
}
