/**
 * VISTA: HeaderView
 * Renderizado de barra de navegación superior, perfiles y badges según rol activo
 */

function updateHeaderUI() {
  if (!currentUser) return;
  
  const displayName = document.getElementById('user-display-name');
  const displayId = document.getElementById('user-display-id');
  const userAvatar = document.getElementById('user-avatar');
  
  if (displayName) displayName.innerText = currentUser.name;
  if (displayId) displayId.innerText = currentUser.email || formatRut(currentUser.rut) || '';
  if (userAvatar) userAvatar.innerText = currentUser.name.charAt(0);

  const roleBadge = document.getElementById('header-role-badge');
  if (roleBadge) {
    if (currentUser.role === 'SUPER_ADMIN') {
      roleBadge.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200";
      roleBadge.innerHTML = '<i class="fa-solid fa-shield-halved mr-1.5"></i> Super Admin';
    } else if (currentUser.role === 'Clinician') {
      roleBadge.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200";
      roleBadge.innerHTML = '<i class="fa-solid fa-user-doctor mr-1.5"></i> Kinesiólogo Clínico';
    } else {
      roleBadge.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200";
      roleBadge.innerHTML = '<i class="fa-solid fa-hands-holding-child mr-1.5"></i> Padre / Tutor';
    }
  }

  const nav = document.getElementById('nav-links');
  if (!nav) return;
  let linksHTML = '';

  if (currentUser.role === 'SUPER_ADMIN') {
    const db = getDB();
    const pendingClinicians = db.users.filter(u => u.role === 'Clinician' && u.status === 'pendiente_validacion').length;

    linksHTML = `
      <button onclick="navigateTo('admin-dashboard')" class="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 font-medium ${currentView === 'admin-dashboard' ? 'bg-purple-100 text-purple-800 font-bold' : ''}">
        <i class="fa-solid fa-chart-pie mr-1.5"></i> Panel Global
      </button>
      <button onclick="navigateTo('admin-form-builder')" class="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 font-medium ${currentView === 'admin-form-builder' ? 'bg-purple-100 text-purple-800 font-bold' : ''}">
        <i class="fa-solid fa-sliders mr-1.5"></i> Banco de Preguntas
      </button>
      <button onclick="navigateTo('admin-users')" class="relative px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 font-medium ${currentView === 'admin-users' ? 'bg-purple-100 text-purple-800 font-bold' : ''}">
        <i class="fa-solid fa-users-gear mr-1.5"></i> Usuarios y Kinesiólogos
        ${pendingClinicians > 0 ? `<span class="ml-1.5 px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white animate-pulse">${pendingClinicians} por validar</span>` : ''}
      </button>
      <button onclick="navigateTo('admin-audit')" class="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 font-medium ${currentView === 'admin-audit' ? 'bg-purple-100 text-purple-800 font-bold' : ''}">
        <i class="fa-solid fa-scroll mr-1.5"></i> Historial de Auditoría
      </button>
    `;
  } else if (currentUser.role === 'Clinician') {
    const db = getDB();
    const pendingCount = db.evaluations.filter(e => (e.assignedClinicianId === currentUser.id || !e.assignedClinicianId) && e.status !== 'REVISADO_CON_RESPUESTA' && e.status !== 'REQUIERE_PRESENCIAL').length;

    linksHTML = `
      <button onclick="navigateTo('clinician-cases')" class="relative px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 font-medium ${currentView === 'clinician-cases' ? 'bg-teal-50 text-teal-800 font-bold' : ''}">
        <i class="fa-solid fa-inbox mr-1.5"></i> Casos y Visor Multimedia
        ${pendingCount > 0 ? `<span class="ml-1.5 px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white animate-pulse">${pendingCount} por dictaminar</span>` : ''}
      </button>
    `;
  } else {
    linksHTML = `
      <button onclick="navigateTo('parent-children')" class="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 font-medium ${currentView === 'parent-children' ? 'bg-teal-50 text-teal-700 font-bold' : ''}">
        <i class="fa-solid fa-children mr-1.5"></i> Mis Niños
      </button>
      <button onclick="navigateTo('parent-evaluations')" class="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 font-medium ${currentView === 'parent-evaluations' ? 'bg-teal-50 text-teal-700 font-bold' : ''}">
        <i class="fa-solid fa-clipboard-check mr-1.5"></i> Historial y Dictámenes Oficiales
      </button>
    `;
  }

  nav.innerHTML = linksHTML;
}
