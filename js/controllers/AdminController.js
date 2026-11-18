/**
 * CONTROLADOR: AdminController
 * Validación, aprobación y suspensión de profesionales ante el Registro SIS
 */

function approveClinicianAccount(userId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  user.status = 'activo';
  addAuditLog('APROBACION_SIS', `Kinesiólogo ${user.name} (Reg. SIS: ${user.sisRegister || 'N/A'}) aprobado por Super Admin`);
  saveDB(db);
  showToast(`Cuenta de ${user.name} validada con éxito.`, 'success');
  renderAdminUsers(document.getElementById('app-content'));
}

function rejectClinicianAccount(userId) {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return;
  user.status = 'suspendido';
  addAuditLog('SUSPENSION_CUENTA', `Cuenta de ${user.name} suspendida por Super Admin`);
  saveDB(db);
  showToast(`Cuenta de ${user.name} suspendida.`, 'info');
  renderAdminUsers(document.getElementById('app-content'));
}
