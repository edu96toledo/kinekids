/**
 * VISTA: AdminView
 * Panel de gobernanza global, gestión y validación SIS de profesionales y registro de auditoría clínica
 */

function renderAdminDashboard(container) {
  const db = getDB();
  const totalUsers = db.users.length;
  const totalChildren = db.children.length;
  const totalEvals = db.evaluations.length;
  const totalMedia = db.evaluations.reduce((acc, e) => acc + (e.media ? e.media.length : 0), 0);
  const pendingClinicians = db.users.filter(u => u.role === 'Clinician' && u.status === 'pendiente_validacion').length;

  container.innerHTML = `
    <div class="mb-8">
      <div class="flex items-center space-x-2 text-purple-700 font-bold text-xs uppercase tracking-wider mb-1">
        <i class="fa-solid fa-shield-halved"></i>
        <span>Panel Global • Gobernanza Sanitaria & Auditoría</span>
      </div>
      <h2 class="text-2xl font-black text-slate-900 tracking-tight">Panel de Control Global (Super Admin)</h2>
      <p class="text-sm text-slate-500 mt-1">Conectado como: <b>${currentUser.email}</b> (${currentUser.name})</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <span class="text-xs font-bold text-slate-400 uppercase">Usuarios Totales</span>
        <p class="text-2xl font-black text-slate-900 mt-1">${totalUsers}</p>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <span class="text-xs font-bold text-teal-600 uppercase">Niños en Sistema</span>
        <p class="text-2xl font-black text-teal-700 mt-1">${totalChildren}</p>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <span class="text-xs font-bold text-cyan-600 uppercase">Evaluaciones</span>
        <p class="text-2xl font-black text-cyan-700 mt-1">${totalEvals}</p>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <span class="text-xs font-bold text-purple-600 uppercase">Archivos Multimedia</span>
        <p class="text-2xl font-black text-purple-700 mt-1">${totalMedia}</p>
      </div>
    </div>

    ${pendingClinicians > 0 ? `
      <div class="mb-8 p-5 bg-amber-50 rounded-3xl border-2 border-amber-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center space-x-3 text-amber-900">
          <i class="fa-solid fa-triangle-exclamation text-2xl text-amber-600"></i>
          <div>
            <p class="font-bold text-sm">Hay ${pendingClinicians} kinesiólogo(s) esperando validación de su Registro SIS</p>
            <p class="text-xs text-amber-700">Verifica sus credenciales antes de habilitar su emisión de dictámenes.</p>
          </div>
        </div>
        <button onclick="navigateTo('admin-users')" class="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-sm whitespace-nowrap">
          Validar Profesionales <i class="fa-solid fa-arrow-right ml-1"></i>
        </button>
      </div>
    ` : ''}

    <div class="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <span class="bg-purple-500/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Módulo de Auditoría Clínica</span>
        <h3 class="text-2xl font-black mt-2">Trazabilidad y Ley 20.584</h3>
        <p class="text-sm text-purple-100 max-w-xl mt-1">Inspecciona el registro histórico de logins, creación de fichas, derivaciones y dictámenes oficiales emitidos.</p>
      </div>
      <button onclick="navigateTo('admin-audit')" class="bg-white hover:bg-purple-50 text-purple-900 font-bold px-6 py-3 rounded-2xl text-sm shadow-md transition-all whitespace-nowrap">
        Abrir Registro de Auditoría <i class="fa-solid fa-arrow-right ml-2"></i>
      </button>
    </div>
  `;
}

function renderAdminFormBuilder(container) {
  const db = getDB();

  container.innerHTML = `
    <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Banco de Preguntas Clínicas Dinámicas</h2>
        <p class="text-sm text-slate-500 mt-1">10 preguntas elocuentes con conceptos biomecánicos y ponderación de gravedad.</p>
      </div>
    </div>

    <div class="space-y-4">
      ${db.questions.map(q => `
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div class="flex items-center space-x-2 mb-2">
            <span class="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md">${q.category}</span>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              <i class="fa-solid fa-cake-candles mr-1"></i> Rango: <b>${q.ageMinMonths} a ${q.ageMaxMonths} meses</b>
            </span>
          </div>
          <h4 class="text-base font-bold text-slate-900 mb-1">${q.text}</h4>
          ${q.subtitleHelp ? `<p class="text-xs text-slate-500 mb-3 italic">${q.subtitleHelp}</p>` : ''}
          <div class="space-y-1.5 pl-3 border-l-2 border-purple-500">
            ${q.options.map(o => `
              <div class="text-xs text-slate-600 flex justify-between items-center py-1">
                <div>
                  <span class="font-medium text-slate-800">• ${o.text}</span>
                  <span class="text-[10px] text-slate-400 block ml-2">↳ ${o.clinicalConcept}</span>
                </div>
                ${o.isRedFlag ? '<span class="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full"><i class="fa-solid fa-flag mr-1"></i>Bandera Roja</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAdminUsers(container) {
  const db = getDB();
  const pendingClinicians = db.users.filter(u => u.role === 'Clinician' && u.status === 'pendiente_validacion');

  container.innerHTML = `
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Gestión de Usuarios y Validación de Kinesiólogos</h2>
        <p class="text-sm text-slate-500 mt-1">Verificación obligatoria de Registro SIS ante la Superintendencia de Salud de Chile.</p>
      </div>
    </div>

    <!-- SECCIÓN: KINESIÓLOGOS PENDIENTES DE VALIDACIÓN -->
    ${pendingClinicians.length > 0 ? `
      <div class="mb-8 bg-amber-50/80 rounded-3xl p-6 border-2 border-amber-300 shadow-sm">
        <div class="flex items-center space-x-2 text-amber-900 font-black text-sm uppercase tracking-wider mb-3">
          <i class="fa-solid fa-user-clock text-amber-600 text-base"></i>
          <span>Kinesiólogos Pendientes de Aprobación SIS (${pendingClinicians.length})</span>
        </div>
        <div class="space-y-3">
          ${pendingClinicians.map(pc => `
            <div class="p-4 bg-white rounded-2xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span class="font-bold text-slate-900 text-sm block">${pc.name}</span>
                <span class="text-xs text-slate-500 block">${pc.email} • RUT: ${pc.rut ? formatRut(pc.rut) : 'N/R'}</span>
                <div class="mt-1 flex items-center space-x-2">
                  <span class="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    N° SIS: ${pc.sisRegister || 'Sin registrar'}
                  </span>
                  <span class="text-xs text-slate-600">${pc.specialty || 'General'}</span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button onclick="approveClinicianAccount(${pc.id})" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center">
                  <i class="fa-solid fa-circle-check mr-1.5"></i> Validar & Aprobar
                </button>
                <button onclick="rejectClinicianAccount(${pc.id})" class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all">
                  Rechazar
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- TABLA COMPLETA DE USUARIOS -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 text-slate-400 text-xs uppercase font-bold border-b border-slate-200">
          <tr>
            <th class="p-4">Nombre / Especialidad</th>
            <th class="p-4">RUT</th>
            <th class="p-4">Registro SIS</th>
            <th class="p-4">Rol Asignado</th>
            <th class="p-4">Estado</th>
            <th class="p-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${db.users.map(u => `
            <tr class="hover:bg-slate-50">
              <td class="p-4">
                <span class="font-bold text-slate-800 block">${u.name}</span>
                <span class="text-xs text-slate-500 block">${u.email}</span>
              </td>
              <td class="p-4 text-slate-600 text-xs font-mono">${u.rut ? formatRut(u.rut) : '<span class="text-slate-400">Sin RUT</span>'}</td>
              <td class="p-4 text-xs font-mono">
                ${u.sisRegister ? `<span class="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">${u.sisRegister}</span>` : '<span class="text-slate-300">-</span>'}
              </td>
              <td class="p-4">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'Clinician' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'}">
                  ${u.role}
                </span>
              </td>
              <td class="p-4">
                <span class="text-xs font-bold px-2 py-0.5 rounded-full ${u.status === 'activo' || !u.status ? 'bg-emerald-100 text-emerald-800' : u.status === 'pendiente_validacion' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}">
                  ${u.status === 'pendiente_validacion' ? 'Pendiente SIS' : u.status === 'suspendido' ? 'Suspendido' : 'Activo'}
                </span>
              </td>
              <td class="p-4 text-right space-x-1">
                ${u.role === 'Clinician' ? `
                  ${u.status === 'suspendido' ? `
                    <button onclick="approveClinicianAccount(${u.id})" class="text-xs text-emerald-600 hover:text-emerald-800 font-bold mr-2">Reactivar</button>
                  ` : `
                    <button onclick="rejectClinicianAccount(${u.id})" class="text-xs text-rose-600 hover:text-rose-800 font-bold mr-2">Suspender</button>
                  `}
                ` : ''}
                ${u.id !== currentUser.id ? `
                  <button onclick="fillAndLogin('${u.email || u.rut}', '${u.password}')" class="text-xs text-purple-600 hover:text-purple-800 font-bold">
                    Impersonar
                  </button>
                ` : '<span class="text-xs text-slate-400 font-semibold">Tú</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminAudit(container) {
  const db = getDB();
  const logs = db.auditLog || [];

  container.innerHTML = `
    <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Registro de Auditoría Clínica</h2>
        <p class="text-sm text-slate-500 mt-1">Cumplimiento Ley 20.584: Trazabilidad de accesos, consentimientos y dictámenes.</p>
      </div>
      <button onclick="clearAuditLog()" class="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors">
        <i class="fa-solid fa-trash-can mr-1"></i> Limpiar Registro
      </button>
    </div>

    ${logs.length === 0 ? `
      <div class="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
        <i class="fa-solid fa-scroll text-5xl text-slate-300 mb-3 block"></i>
        <p class="text-slate-500 text-sm">No hay eventos registrados en el log aún.</p>
      </div>
    ` : `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-400 uppercase font-bold border-b border-slate-200">
            <tr>
              <th class="p-4">Fecha / Hora</th>
              <th class="p-4">Usuario Responsable</th>
              <th class="p-4">Acción</th>
              <th class="p-4">Descripción del Evento</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${logs.map(log => {
              const date = new Date(log.timestamp);
              const actionColors = {
                'LOGIN': 'bg-blue-100 text-blue-800',
                'LOGOUT': 'bg-slate-100 text-slate-700',
                'REGISTRO_USUARIO': 'bg-teal-100 text-teal-800',
                'RECUPERACION_PASSWORD': 'bg-amber-100 text-amber-800',
                'CREAR_FICHA': 'bg-cyan-100 text-cyan-800',
                'ELIMINAR_FICHA': 'bg-rose-100 text-rose-800',
                'EVALUACION_CREADA': 'bg-purple-100 text-purple-800',
                'EVALUACION_ENVIADA': 'bg-amber-100 text-amber-800',
                'DERIVACION_CASO': 'bg-indigo-100 text-indigo-800',
                'SUBIDA_MULTIMEDIA': 'bg-emerald-100 text-emerald-800',
                'DICTAMEN_OFICIAL': 'bg-emerald-600 text-white',
                'APROBACION_SIS': 'bg-green-100 text-green-800',
                'SUSPENSION_CUENTA': 'bg-rose-600 text-white'
              };
              const badgeClass = actionColors[log.action] || 'bg-slate-100 text-slate-700';
              return `
                <tr class="hover:bg-slate-50">
                  <td class="p-4 font-mono text-slate-500 whitespace-nowrap">
                    <span class="block">${date.toLocaleDateString('es-CL')}</span>
                    <span class="text-[10px] text-slate-400">${date.toLocaleTimeString('es-CL', {hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
                  </td>
                  <td class="p-4 font-semibold text-slate-800">${log.userName || 'Sistema'}</td>
                  <td class="p-4"><span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${badgeClass}">${log.action}</span></td>
                  <td class="p-4 text-slate-600">${log.description}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `}
  `;
}
