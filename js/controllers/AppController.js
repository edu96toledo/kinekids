/**
 * CONTROLADOR: AppController
 * Estado global, enrutamiento, ciclo de vida y control de sesiones
 */

let currentUser = null;
let currentRole = null;
let currentView = 'login';
let windowActiveFilter = 'all';

function checkAuthAndRoute() {
  const session = getActiveSession();
  if (!session) {
    currentUser = null;
    currentRole = null;
    const header = document.getElementById('app-header');
    if (header) header.classList.add('hidden');
    renderLoginView();
  } else {
    currentUser = session;
    currentRole = session.role;
    const header = document.getElementById('app-header');
    if (header) header.classList.remove('hidden');
    updateHeaderUI();
    navigateTo(getDefaultViewForRole(currentRole));
  }
}

function getDefaultViewForRole(role) {
  if (role === 'SUPER_ADMIN') return 'admin-dashboard';
  if (role === 'Clinician') return 'clinician-cases';
  return 'parent-children';
}

function navigateTo(view, params = null) {
  currentView = view;
  updateHeaderUI();
  const content = document.getElementById('app-content');

  switch (view) {
    case 'parent-children':
      renderParentChildren(content);
      break;
    case 'parent-wizard':
      renderEvaluationWizard(content, params);
      break;
    case 'parent-triage-result':
      renderTriageResultView(content, params);
      break;
    case 'parent-evaluations':
      renderParentEvaluations(content);
      break;
    case 'clinician-cases':
      renderClinicianCases(content);
      break;
    case 'admin-dashboard':
      renderAdminDashboard(content);
      break;
    case 'admin-form-builder':
      renderAdminFormBuilder(content);
      break;
    case 'admin-users':
      renderAdminUsers(content);
      break;
    case 'admin-audit':
      renderAdminAudit(content);
      break;
    default:
      renderLoginView();
  }
}

function handleLogout() {
  if (currentUser) {
    addAuditLog('LOGOUT', `Cierre de sesión de ${currentUser.name}`);
  }
  clearActiveSession();
  showToast('Sesión cerrada correctamente', 'info');
  checkAuthAndRoute();
}
