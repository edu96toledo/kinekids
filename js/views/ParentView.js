/**
 * VISTA: ParentView
 * Renderizado de perfiles de niños, wizard biomecánico, galería multimedia, triaje e historial
 */

function renderParentChildren(container) {
  const db = getDB();
  const children = db.children.filter(c => c.parentId === currentUser.id);

  let cardsHTML = children.map(child => {
    const age = calculateExactAge(child.birthDate, child.gestationWeeks);
    return `
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start">
            <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl mb-4 font-bold">
              ${child.gender === 'Femenino' ? '<i class="fa-solid fa-child-dress"></i>' : '<i class="fa-solid fa-child"></i>'}
            </div>
            <div class="text-right">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                ${age.years} años, ${age.months} meses
              </span>
              ${age.isPremature ? `
                <span class="block text-[10px] text-amber-700 font-bold mt-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Prematuro (${child.gestationWeeks} sem) • Edad corregida: ${age.correctedMonths}m
                </span>
              ` : ''}
            </div>
          </div>
          <h3 class="text-xl font-bold text-slate-800">${child.name}</h3>
          <p class="text-xs text-slate-500 mt-0.5">Nacimiento: ${child.birthDate} (${age.totalMonths} meses cronológicos)</p>
          
          <div class="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
            <div class="flex justify-between text-slate-700">
              <span><i class="fa-solid fa-weight-scale text-slate-400 mr-1"></i> Peso/Talla:</span>
              <span class="font-bold">${child.weightKg ? child.weightKg + ' kg' : 'N/R'} / ${child.heightCm ? child.heightCm + ' cm' : 'N/R'}</span>
            </div>
            <div class="flex justify-between text-slate-700">
              <span><i class="fa-solid fa-shoe-prints text-slate-400 mr-1"></i> Inicio Marcha:</span>
              <span class="font-bold">${child.walkStartMonths ? child.walkStartMonths + ' meses' : 'En observación'}</span>
            </div>
            ${child.medicalHistory ? `
              <div class="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 mt-2">
                <span class="font-bold text-slate-700 block mb-0.5">Antecedentes:</span>
                <p class="line-clamp-2">${child.medicalHistory}</p>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="mt-6 flex space-x-2">
          <button onclick="navigateTo('parent-wizard', { childId: ${child.id} })" class="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-2xl text-sm transition-colors flex items-center justify-center shadow-sm">
            <i class="fa-solid fa-play mr-2"></i> Evaluar Marcha
          </button>
          <button onclick="confirmDeleteChild(${child.id}, '${child.name.replace(/'/g, "\\\\'")}')" class="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors" title="Eliminar ficha clínica">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Perfiles de mis Hijos</h2>
        <p class="text-sm text-slate-500 mt-1">Ficha pediátrica ampliada, triaje biomecánico y resguardo clínico (Ley 20.584).</p>
      </div>
      <button onclick="openAddChildModal()" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-2xl text-sm shadow-md shadow-teal-600/20 transition-all flex items-center">
        <i class="fa-solid fa-plus mr-2"></i> Registrar Nuevo Niño
      </button>
    </div>

    ${children.length === 0 ? `
      <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
        <i class="fa-solid fa-baby text-5xl text-slate-300 mb-4"></i>
        <h3 class="text-lg font-bold text-slate-700">No hay niños registrados en tu cuenta</h3>
        <p class="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">Registra a tu hijo con sus antecedentes perinatales para adaptar el cuestionario de marcha.</p>
        <button onclick="openAddChildModal()" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm">
          Registrar Niño
        </button>
      </div>
    ` : `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${cardsHTML}
      </div>
    `}
  `;
}

function openAddChildModal() {
  const modal = document.getElementById('modal-container');
  const card = document.getElementById('modal-card');
  if (!modal || !card) return;

  card.innerHTML = `
    <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
      <div>
        <h3 class="text-lg font-black text-slate-900">Registrar Ficha Clínica Pediátrica</h3>
        <p class="text-xs text-slate-500">Datos fundamentales para el análisis motor y cálculo de edad corregida.</p>
      </div>
      <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form onsubmit="handleCreateChild(event)" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre Completo *</label>
          <input type="text" id="new-child-name" required placeholder="Ej. Mateo Gómez" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Género *</label>
          <select id="new-child-gender" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Fecha de Nacimiento (Hasta 12 años) *</label>
        <input type="date" id="new-child-dob" required onchange="previewChildAge()" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
        <p id="dob-preview-text" class="text-xs mt-1 text-slate-500 italic"></p>
      </div>

      <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <span class="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center">
          <i class="fa-solid fa-notes-medical mr-1.5 text-teal-600"></i> Antecedentes Biomecánicos y de Maduración
        </span>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1">Semanas de Gestación</label>
            <input type="number" id="new-child-gestation" min="24" max="43" placeholder="40" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none">
            <span class="text-[10px] text-slate-400">&lt; 37 sem = Prematuro</span>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1">Inicio Marcha (Meses)</label>
            <input type="number" id="new-child-walk" min="6" max="36" placeholder="Ej. 13" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none">
            <span class="text-[10px] text-slate-400">Opcional</span>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-700 mb-1">Peso / Talla aprox.</label>
            <div class="flex space-x-1">
              <input type="number" step="0.1" id="new-child-weight" placeholder="Kg" class="w-1/2 px-2 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none">
              <input type="number" step="0.5" id="new-child-height" placeholder="Cm" class="w-1/2 px-2 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none">
            </div>
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">Antecedentes Médicos / Diagnósticos Previos</label>
          <textarea id="new-child-history" rows="2" placeholder="Ej: Displasia de cadera en tratamiento, uso de plantillas, hipotonía benigna, caídas recurrentes..." 
                    class="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"></textarea>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3 pt-3 border-t border-slate-100">
        <button type="button" onclick="closeModal()" class="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
        <button type="submit" class="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md">Guardar Ficha Clínica</button>
      </div>
    </form>
  `;
  modal.classList.remove('hidden');
}

function previewChildAge() {
  const val = document.getElementById('new-child-dob')?.value;
  const preview = document.getElementById('dob-preview-text');
  if (!val || !preview) return;
  const age = calculateExactAge(val);
  if (!age.isValid) {
    preview.innerHTML = `<span class="text-rose-600 font-semibold"><i class="fa-solid fa-triangle-exclamation mr-1"></i> El niño supera los 12 años (${age.years} años). El rango pediátrico admitido son 144 meses.</span>`;
  } else {
    preview.innerHTML = `<span class="text-teal-600 font-medium">Edad calculada: <b>${age.years} años y ${age.months} meses</b> (${age.totalMonths} meses).</span>`;
  }
}

function confirmDeleteChild(id, name) {
  const modal = document.getElementById('modal-container');
  const card = document.getElementById('modal-card');
  if (!modal || !card) return;

  card.innerHTML = `
    <div class="text-center p-2">
      <div class="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl mb-4">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="text-lg font-black text-slate-900 mb-2">¿Seguro que deseas eliminar la ficha clínica?</h3>
      <p class="text-xs text-slate-600 max-w-md mx-auto leading-relaxed mb-4">
        Estás a punto de eliminar la ficha de <b>${name}</b>. De acuerdo a la normativa de resguardo de información clínica (Ley 20.584), se eliminarán permanentemente las evaluaciones y videos asociados.
      </p>
      <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold mb-6">
        Esta acción es irreversible y no se puede deshacer.
      </div>
      <div class="flex justify-center space-x-3">
        <button onclick="closeModal()" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
        <button onclick="deleteChildConfirmed(${id})" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md">
          Sí, Eliminar Definitivamente
        </button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
}

function renderEvaluationWizard(container, params) {
  const db = getDB();
  const childId = params?.childId;
  const child = db.children.find(c => c.id === childId);

  if (!child) {
    container.innerHTML = `<div class="p-8 text-center text-rose-600">Niño no encontrado.</div>`;
    return;
  }

  const age = calculateExactAge(child.birthDate, child.gestationWeeks);
  const targetMonths = age.isPremature ? age.correctedMonths : age.totalMonths;
  const applicableQuestions = db.questions.filter(q => {
    return targetMonths >= q.ageMinMonths && targetMonths <= q.ageMaxMonths;
  });

  container.innerHTML = `
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span class="text-xs font-black uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">
              Cuestionario Biomecánico Adaptativo
            </span>
            <h2 class="text-2xl font-black text-slate-900 mt-2">Evaluación de Marcha: ${child.name}</h2>
            <p class="text-sm text-slate-500 mt-1">
              Edad cronológica: <b class="text-slate-800">${age.years} años y ${age.months} meses</b> (${age.totalMonths} meses).
              ${age.isPremature ? `<span class="text-amber-700 font-bold ml-1">(Edad corregida: ${age.correctedMonths}m)</span>` : ''}
            </p>
          </div>
          <div class="text-right">
            <span class="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-xl font-bold inline-block">
              <i class="fa-solid fa-list-check text-teal-600 mr-1"></i> ${applicableQuestions.length} Preguntas adaptadas
            </span>
          </div>
        </div>

        <div class="mt-4 p-3.5 bg-cyan-50/70 rounded-2xl border border-cyan-100 text-xs text-cyan-900 flex items-start">
          <i class="fa-solid fa-camera text-cyan-600 text-base mr-3 mt-0.5"></i>
          <div>
            <span class="font-bold">Guía Biomecánica y Multimedia:</span>
            <p class="mt-0.5 text-cyan-800">Al terminar el cuestionario podrá adjuntar videos (plano sagital y frontal) y firmar el consentimiento de telemedicina para análisis profesional en cámara lenta.</p>
          </div>
        </div>
      </div>

      <form id="evaluation-form" onsubmit="handleSubmitEvaluation(event, ${child.id}, ${age.years}, ${age.months}, ${age.totalMonths})">
        <div class="space-y-6">
          ${applicableQuestions.map((q, idx) => `
            <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                  Pregunta ${idx + 1} de ${applicableQuestions.length} • ${q.category}
                </span>
                <span class="text-[11px] text-slate-400 font-medium">
                  Rango: ${(q.ageMinMonths/12).toFixed(1)} a ${(q.ageMaxMonths/12).toFixed(1)} años
                </span>
              </div>

              <h4 class="text-base font-bold text-slate-900 mt-2">${q.text}</h4>
              ${q.subtitleHelp ? `<p class="text-xs text-slate-500 mb-4 italic">${q.subtitleHelp}</p>` : '<div class="mb-3"></div>'}

              <div class="space-y-2.5">
                ${q.options.map((opt) => `
                  <label class="flex items-start p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50/40">
                    <input type="radio" name="q_${q.id}" value="${opt.id}" required 
                           data-qtext="${q.text}" data-atext="${opt.text}" data-risk="${opt.riskWeight}" 
                           data-clinical="${opt.clinicalConcept}" data-redflag="${opt.isRedFlag ? 'true' : 'false'}"
                           class="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300 mt-1">
                    <div class="ml-3 flex-1">
                      <span class="text-sm font-semibold text-slate-800 block">${opt.text}</span>
                      <span class="text-[11px] text-slate-400 block mt-0.5"><i class="fa-solid fa-stethoscope text-[10px] mr-1"></i> Concepto clínico: ${opt.clinicalConcept}</span>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="mt-8 mb-12 flex justify-between items-center">
          <button type="button" onclick="navigateTo('parent-children')" class="px-5 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-200/60">
            Cancelar
          </button>
          <button type="submit" class="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-2xl text-sm shadow-md shadow-teal-500/20 flex items-center">
            <i class="fa-solid fa-wand-magic-sparkles mr-2"></i> Continuar a Triaje y Evidencia
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderTriageResultView(container, params) {
  const db = getDB();
  const ev = db.evaluations.find(e => e.id === params?.evalId);
  if (!ev) {
    container.innerHTML = `<div class="p-8 text-center text-rose-600">Evaluación no encontrada.</div>`;
    return;
  }

  const isGreen = ev.riskLevel === 'Verde';
  const isYellow = ev.riskLevel === 'Amarillo';
  const isRed = ev.riskLevel === 'Rojo';
  const clinicians = db.users.filter(u => u.role === 'Clinician' && u.status === 'activo');
  const mediaList = ev.media || [];

  const photoCount = mediaList.filter(m => m.tipoArchivo === 'FOTO').length;
  const videoCount = mediaList.filter(m => m.tipoArchivo === 'VIDEO').length;

  container.innerHTML = `
    <div class="max-w-3xl mx-auto my-4 space-y-6">
      
      <!-- TARJETA DEL SEMÁFORO CLÍNICO -->
      <div class="bg-white rounded-3xl p-8 border ${isRed ? 'border-rose-300 shadow-rose-100' : isYellow ? 'border-amber-300 shadow-amber-100' : 'border-emerald-300 shadow-emerald-100'} shadow-xl">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl text-white ${isRed ? 'bg-rose-500 shadow-lg shadow-rose-500/30' : isYellow ? 'bg-amber-500 shadow-lg shadow-amber-500/30' : 'bg-emerald-500 shadow-lg shadow-emerald-500/30'}">
            ${isRed ? '<i class="fa-solid fa-triangle-exclamation"></i>' : isYellow ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-circle-check"></i>'}
          </div>
          <div>
            <span class="text-xs font-black uppercase tracking-wider ${isRed ? 'text-rose-600' : isYellow ? 'text-amber-600' : 'text-emerald-600'}">
              Resultado del Triaje Pediátrico: Semáforo ${ev.riskLevel} (${ev.totalScore} pts)
            </span>
            <h2 class="text-2xl font-black text-slate-900 mt-0.5">
              ${isRed ? 'Derivación Prioritaria a Kinesiología' : isYellow ? 'Marcha en Observación • Consulta Sugerida' : 'Marcha Esperable y Saludable'}
            </h2>
            <p class="text-xs text-slate-500 mt-1">${ev.childName} • ${ev.childAgeYears} años y ${ev.childAgeMonths} meses</p>
          </div>
        </div>

        <p class="text-sm text-slate-600 leading-relaxed mt-2 p-4 rounded-2xl ${isRed ? 'bg-rose-50/70 border border-rose-100 text-rose-950' : isYellow ? 'bg-amber-50/70 border border-amber-100 text-amber-950' : 'bg-emerald-50/70 border border-emerald-100 text-emerald-950'}">
          ${isRed 
            ? 'El sistema detectó signos biomecánicos que requieren ser valorados por un especialista. A continuación adjunte videos de su hijo caminando de perfil y de espaldas para que el profesional los analice cuadro a cuadro.' 
            : isYellow 
            ? 'Existen ciertos patrones para observar con un especialista. Le recomendamos adjuntar videos y fotos para que el kinesiólogo le entregue pautas en el hogar.' 
            : 'Los patrones reportados corresponden a la etapa natural de maduración motora de su hijo. Opcionalmente puede adjuntar videos para el expediente.'}
        </p>

        ${ev.redFlagsList && ev.redFlagsList.length > 0 ? `
          <div class="mt-5 p-4 bg-rose-50 rounded-2xl border border-rose-200">
            <span class="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center mb-2">
              <i class="fa-solid fa-flag text-rose-600 mr-2"></i> Banderas Rojas Identificadas (${ev.redFlagsList.length})
            </span>
            <div class="space-y-2">
              ${ev.redFlagsList.map(rf => `
                <div class="text-xs bg-white p-3 rounded-xl border border-rose-100 text-slate-700">
                  <p class="font-bold text-slate-900">${rf.questionText}</p>
                  <p class="text-rose-600 mt-0.5 font-medium">↳ Respuesta: ${rf.answerText}</p>
                  <p class="text-[11px] text-slate-400 mt-1 italic">Concepto clínico: ${rf.clinicalConcept}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- GUÍA VISUAL BIOMECÁNICA Y CARGA MULTIMEDIA -->
      <div class="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              Protocolo de Captura Biomecánica
            </span>
            <h3 class="text-xl font-black text-slate-900 mt-1">Evidencia Visual para el Kinesiólogo</h3>
            <p class="text-xs text-slate-500 mt-0.5">Siga estas pautas clínicas para que el profesional analice el choque de talón y la simetría.</p>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-500 font-semibold block">Límites por evaluación:</span>
            <span class="text-xs font-bold ${photoCount >= 3 ? 'text-amber-600' : 'text-teal-700'}">${photoCount}/3 Fotos</span> • 
            <span class="text-xs font-bold ${videoCount >= 2 ? 'text-amber-600' : 'text-teal-700'}">${videoCount}/2 Videos (máx 50MB)</span>
          </div>
        </div>

        <!-- Tarjetas de Guía Instructiva Biomecánica -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div class="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 text-xs">
            <div class="flex items-center space-x-2 text-teal-800 font-black mb-1.5">
              <span class="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs">1</span>
              <span>Video 1 (Plano Sagital / De Perfil)</span>
            </div>
            <p class="text-slate-600 leading-relaxed">
              Grabe al niño <b>caminando de perfil</b>, con el cuerpo completo visible y la cámara a la <b>altura de la cadera o rodillas</b>. El niño debe estar <b>descalzo</b> sobre un piso plano y liso (máx 15-30s).
            </p>
          </div>

          <div class="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 text-xs">
            <div class="flex items-center space-x-2 text-teal-800 font-black mb-1.5">
              <span class="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs">2</span>
              <span>Video 2 (Plano Frontal y Posterior)</span>
            </div>
            <p class="text-slate-600 leading-relaxed">
              Grabe al niño <b>caminando hacia la cámara y alejándose en línea recta</b>. Esto permite observar el ancho de la base de sustentación, la dirección de las puntas y el alineamiento de rodillas.
            </p>
          </div>

          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span class="font-bold text-slate-800 flex items-center mb-1"><i class="fa-solid fa-camera text-teal-600 mr-1.5"></i> Foto 1 (Alineación Posterior):</span>
            <p class="text-slate-600">Foto desde atrás estando el niño de pie descalzo para observar la rectitud de talones (retropié) y rodillas.</p>
          </div>

          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span class="font-bold text-slate-800 flex items-center mb-1"><i class="fa-solid fa-shoe-prints text-teal-600 mr-1.5"></i> Foto 2 (Suela del Calzado):</span>
            <p class="text-slate-600">Foto de la suela de sus zapatillas puestas sobre una mesa para evaluar desgastes asimétricos o deformación interna.</p>
          </div>
        </div>

        <!-- Galería de Medios Ya Subidos -->
        <div class="space-y-3 mb-6">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block">Archivos Adjuntos a esta Evaluación:</span>
          ${mediaList.length === 0 ? `
            <div class="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs text-slate-500">
              <i class="fa-solid fa-cloud-arrow-up text-3xl text-slate-300 mb-2 block"></i>
              Aún no has adjuntado archivos. Puedes subir tus propios videos/fotos reales o usar muestras de prueba.
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${mediaList.map(m => `
                <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div class="flex items-center space-x-3 overflow-hidden">
                    <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-lg flex-shrink-0">
                      ${m.tipoArchivo === 'VIDEO' ? '<i class="fa-solid fa-film"></i>' : '<i class="fa-solid fa-image"></i>'}
                    </div>
                    <div class="truncate">
                      <span class="text-xs font-bold text-slate-800 block truncate">${m.tituloDescriptivo}</span>
                      <span class="text-[10px] text-slate-400 block">${m.tipoArchivo} • ${m.categoriaVista} • ${(m.tamanoBytes / 1000000).toFixed(1)}MB</span>
                    </div>
                  </div>
                  <button onclick="removeMediaFromEval(${ev.id}, ${m.id})" class="text-rose-500 hover:text-rose-700 p-2 text-xs font-semibold" title="Eliminar archivo">
                    <i class="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Botones de Acción de Carga y Validación -->
        <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100 items-center justify-between">
          <div class="flex flex-wrap gap-2">
            <label class="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center shadow-sm">
              <i class="fa-solid fa-upload mr-1.5"></i> Subir Archivo Real (.mp4, .mov, .jpg, .png)
              <input type="file" accept="video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp" onchange="handleRealFileUpload(event, ${ev.id})" class="hidden">
            </label>

            <button type="button" onclick="attachSampleMedia(${ev.id}, 'VIDEO')" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
              <i class="fa-solid fa-video mr-1 text-teal-600"></i> Video Demo (15s)
            </button>
            <button type="button" onclick="attachSampleMedia(${ev.id}, 'FOTO_FEET')" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
              <i class="fa-solid fa-image mr-1 text-teal-600"></i> Foto Tobillos
            </button>
          </div>
          <span class="text-[11px] text-slate-400">Máx 50 MB por archivo</span>
        </div>
      </div>

      <!-- MÓDULO DE DERIVACIÓN CON CONSENTIMIENTO INFORMADO (LEY 20.584) -->
      ${(isRed || isYellow) ? `
        <div class="bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
          <div class="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
            <i class="fa-solid fa-paper-plane"></i>
            <span>Derivación a Especialista con Evidencia Visual</span>
          </div>
          <h3 class="text-2xl font-black">Enviar Caso y Videos a Kinesiología</h3>
          <p class="text-xs text-teal-100 mt-1 max-w-xl">
            Al enviar este caso, el profesional podrá revisar los videos en cámara lenta cuadro a cuadro y emitir su dictamen oficial con o sin citación presencial.
          </p>

          ${ev.referralStatus === 'Respondida' ? `
            <div class="mt-6 p-4 bg-teal-800/60 rounded-2xl border border-teal-500/50 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <i class="fa-solid fa-circle-check text-teal-300 text-2xl"></i>
                <div>
                  <p class="font-bold text-sm">Dictamen emitido por: ${ev.assignedClinicianName}</p>
                  <p class="text-xs text-teal-200">Revisa la tarjeta oficial en tu historial.</p>
                </div>
              </div>
              <button onclick="navigateTo('parent-evaluations')" class="px-4 py-2 bg-white text-teal-900 font-bold text-xs rounded-xl hover:bg-teal-50">
                Ir al Historial
              </button>
            </div>
          ` : ev.referralStatus === 'Derivada' ? `
            <div class="mt-6 p-4 bg-cyan-800/60 rounded-2xl border border-cyan-400/40 flex items-center justify-between">
              <div>
                <p class="font-bold text-sm">Ficha derivada a: ${ev.assignedClinicianName}</p>
                <p class="text-xs text-cyan-200">El kinesiólogo está analizando la marcha y los videos adjuntos.</p>
              </div>
              <button onclick="navigateTo('parent-evaluations')" class="px-4 py-2 bg-white text-cyan-900 font-bold text-xs rounded-xl">
                Ver en Historial
              </button>
            </div>
          ` : `
            <form onsubmit="handleReferCase(event, ${ev.id})" class="mt-6 space-y-4">
              <div>
                <label class="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-2">
                  Seleccionar Kinesiólogo/a de la App
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ${clinicians.map((c, i) => `
                    <label class="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 cursor-pointer transition-all flex items-start space-x-3 has-[:checked]:border-teal-400 has-[:checked]:bg-teal-700/40">
                      <input type="radio" name="selected_clinician" value="${c.id}" data-name="${c.name}" ${i === 0 ? 'checked' : ''} required class="mt-1 text-teal-500 focus:ring-teal-400">
                      <div>
                        <span class="font-bold text-sm text-white block">${c.name}</span>
                        <span class="text-[11px] text-teal-200 block">${c.specialty || 'Kinesiología Pediátrica'}</span>
                        ${c.sisRegister ? `<span class="text-[10px] text-teal-300 font-mono block">Reg. SIS: ${c.sisRegister}</span>` : ''}
                        <span class="text-[10px] text-slate-300 block mt-0.5"><i class="fa-solid fa-location-dot mr-1"></i>${c.clinicAddress || 'Atención Tele-kinesiológica'}</span>
                      </div>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-1">
                  Mensaje o consulta sobre el video para el kinesiólogo (Opcional):
                </label>
                <textarea id="parent-query-text" rows="2" placeholder="Ej: Doctor, en el video se aprecia cómo carga más peso hacia el pie derecho al correr..." 
                          class="w-full p-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"></textarea>
              </div>

              <!-- Consentimiento Informado (Normativa Chilena Ley 20.584 / 19.628) -->
              <div class="p-4 bg-teal-950/70 border border-teal-500/50 rounded-2xl">
                <label class="flex items-start space-x-3 cursor-pointer">
                  <input type="checkbox" id="consent-checkbox" required class="mt-1 w-4 h-4 text-teal-500 focus:ring-teal-400 rounded">
                  <span class="text-xs text-teal-100 font-medium leading-relaxed">
                    Declaro ser el padre/tutor legal del menor y autorizo la captura y análisis de material audiovisual con fines exclusivamente clínicos y de evaluación kinésica.
                    <span class="text-[10px] text-teal-300 block mt-0.5">En cumplimiento de la Ley N° 20.584 (Derechos y Deberes del Paciente) y Ley N° 19.628 (Protección de Datos Personales en Salud).</span>
                  </span>
                </label>
              </div>

              <div class="flex justify-end pt-2">
                <button type="submit" class="bg-gradient-to-r from-teal-400 to-cyan-300 hover:from-teal-500 hover:to-cyan-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs shadow-lg transition-all flex items-center">
                  <i class="fa-solid fa-share-from-square mr-2"></i> Enviar Ficha, Consentimiento y Videos a Kinesiología
                </button>
              </div>
            </form>
          `}
        </div>
      ` : `
        <div class="text-center pt-2">
          <button onclick="navigateTo('parent-evaluations')" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-2xl text-sm shadow-sm">
            Guardar y Ver Mi Historial
          </button>
        </div>
      `}

    </div>
  `;
}

function renderParentEvaluations(container) {
  const db = getDB();
  const myChildIds = db.children.filter(c => c.parentId === currentUser.id).map(c => c.id);
  const evals = db.evaluations.filter(e => myChildIds.includes(e.childId));

  container.innerHTML = `
    <div class="mb-8">
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">Historial de Evaluaciones y Dictámenes Oficiales</h2>
      <p class="text-sm text-slate-500 mt-1">Revisa el informe kinésico oficial, descarga de informes en PDF e indicaciones presenciales.</p>
    </div>

    ${evals.length === 0 ? `
      <div class="text-center py-12 bg-white rounded-3xl border border-slate-200">
        <p class="text-slate-500 text-sm">Aún no has completado evaluaciones de marcha.</p>
      </div>
    ` : `
      <div class="space-y-6">
        ${evals.map(ev => {
          const resp = ev.officialResponse;
          const hasMedia = ev.media && ev.media.length > 0;
          return `
            <div class="bg-white rounded-3xl p-6 border ${ev.status === 'REQUIERE_PRESENCIAL' ? 'border-rose-300' : 'border-slate-200'} shadow-sm hover:shadow-md transition-shadow">
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div class="flex items-center space-x-2">
                    <h3 class="text-lg font-black text-slate-900">${ev.childName}</h3>
                    <span class="text-xs px-3 py-0.5 rounded-full font-bold ${ev.riskLevel === 'Rojo' ? 'bg-rose-100 text-rose-800' : ev.riskLevel === 'Amarillo' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
                      Semáforo: ${ev.riskLevel}
                    </span>
                    ${ev.status === 'REQUIERE_PRESENCIAL' ? `
                      <span class="text-xs px-2.5 py-0.5 rounded-full font-black bg-rose-600 text-white animate-pulse">
                        <i class="fa-solid fa-hospital-user mr-1"></i> Requiere Consulta Presencial
                      </span>
                    ` : ev.status === 'REVISADO_CON_RESPUESTA' ? `
                      <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
                        <i class="fa-solid fa-check-double mr-1"></i> Dictamen Emitido
                      </span>
                    ` : `
                      <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                        En Evaluación
                      </span>
                    `}
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Evaluado el ${ev.date} • Edad: <b>${ev.childAgeYears} años, ${ev.childAgeMonths} meses</b> • ${hasMedia ? `<i class="fa-solid fa-film text-teal-600 ml-1"></i> ${ev.media.length} archivos adjuntos` : 'Sin archivos'}
                  </p>
                </div>

                <div class="flex items-center space-x-2">
                  <button onclick="navigateTo('parent-triage-result', { evalId: ${ev.id} })" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors">
                    Ver Ficha y Videos
                  </button>
                  ${resp ? `
                    <button onclick="printOfficialReport(${ev.id})" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center shadow-sm">
                      <i class="fa-solid fa-file-pdf mr-1.5"></i> Descargar Informe PDF
                    </button>
                  ` : ''}
                </div>
              </div>

              <!-- TARJETA DE DICTAMEN OFICIAL -->
              <div class="mt-4">
                ${resp ? `
                  <div class="p-5 rounded-2xl border ${resp.requiereConsultaPresencial ? 'bg-rose-50/80 border-rose-200' : 'bg-teal-50/80 border-teal-200'}">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-xs font-black uppercase tracking-wider ${resp.requiereConsultaPresencial ? 'text-rose-800' : 'text-teal-800'} flex items-center">
                        <i class="fa-solid fa-certificate mr-1.5"></i> Dictamen Clínico Oficial: ${resp.clinicianName}
                      </span>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${resp.requiereConsultaPresencial ? 'bg-rose-200 text-rose-900' : 'bg-teal-200 text-teal-900'}">${resp.fechaRespuesta}</span>
                    </div>

                    <p class="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-slate-200/80 mb-3">
                      ${resp.mensajeOficialPadre}
                    </p>

                    ${resp.indicacionesDomiciliarias ? `
                      <div class="text-xs text-slate-700 bg-white/70 p-3 rounded-xl border border-slate-200/60 mb-3">
                        <span class="font-bold text-slate-900 block mb-0.5">Pautas para el hogar:</span>
                        <p>${resp.indicacionesDomiciliarias}</p>
                      </div>
                    ` : ''}

                    <!-- BOTÓN DESTACADO AGENDAR EVALUACIÓN PRESENCIAL EN BOX -->
                    ${resp.requiereConsultaPresencial ? `
                      <div class="p-4 bg-white rounded-2xl border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <span class="text-xs font-black text-rose-700 uppercase tracking-wider block">
                            <i class="fa-solid fa-calendar-check mr-1"></i> Citación Presencial en Consulta Kinesiológica
                          </span>
                          <p class="text-xs text-slate-600 mt-0.5">${resp.datosContactoAgenda}</p>
                        </div>
                        <div class="flex space-x-2">
                          <button onclick="openBookingModal('${resp.clinicianName}', '${resp.datosContactoAgenda}', '${resp.bookingUrl || ''}')" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center whitespace-nowrap">
                            <i class="fa-solid fa-hospital-user mr-1.5"></i> Agendar Evaluación en Box
                          </button>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                ` : ev.referralStatus === 'Derivada' ? `
                  <div class="p-3.5 bg-cyan-50/70 border border-cyan-100 rounded-2xl flex items-center justify-between text-xs text-cyan-900">
                    <span><i class="fa-solid fa-clock-rotate-left mr-1.5 text-cyan-600"></i> Ficha y videos derivados a <b>${ev.assignedClinicianName}</b>. Esperando emisión de dictamen.</span>
                  </div>
                ` : `
                  <p class="text-xs text-slate-400 italic">Marcha dentro de parámetros esperables. Sin derivación activa.</p>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

function openBookingModal(clinicianName, address, url) {
  const modal = document.getElementById('modal-container');
  const card = document.getElementById('modal-card');
  if (!modal || !card) return;

  card.innerHTML = `
    <div class="text-center p-2">
      <div class="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl mb-4">
        <i class="fa-solid fa-hospital"></i>
      </div>
      <h3 class="text-lg font-black text-slate-900 mb-1">Agendar Evaluación Presencial en Box</h3>
      <p class="text-xs text-slate-500 mb-4">Profesional asignado: <b>${clinicianName}</b></p>
      
      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 mb-6">
        <div>
          <span class="font-bold text-slate-700 block">Lugar de Atención:</span>
          <p class="text-slate-600">${address}</p>
        </div>
        <div>
          <span class="font-bold text-slate-700 block">Recomendaciones para la sesión:</span>
          <p class="text-slate-600">Asistir con ropa cómoda (short/calzas cortas) y el calzado que el niño usa con mayor frecuencia.</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-center gap-3">
        <button onclick="closeModal()" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50">
          Cerrar
        </button>
        <a href="${url || '#'}" target="_blank" onclick="closeModal()" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shadow-md">
          <i class="fa-brands fa-whatsapp text-sm mr-2"></i> Contactar por WhatsApp y Confirmar Hora
        </a>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
}
