/**
 * MODELO: AuditModel
 * Registro de auditoría clínica en cumplimiento con la Ley N° 20.584 y 19.628 (Chile)
 * Trazabilidad de accesos, consentimiento informado, dictámenes y aprobaciones
 */

function addAuditLog(action, description) {
  try {
    const db = getDB();
    if (!db.auditLog) db.auditLog = [];
    db.auditLog.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || null,
      userName: currentUser?.name || 'Sistema',
      action,
      description
    });
    if (db.auditLog.length > 200) db.auditLog = db.auditLog.slice(0, 200);
    saveDB(db);
  } catch (err) {
    console.error('Audit log error', err);
  }
}

function clearAuditLog() {
  if (!confirm('¿Seguro que deseas vaciar el historial de auditoría?')) return;
  const db = getDB();
  db.auditLog = [];
  saveDB(db);
  showToast('Registro de auditoría limpiado', 'info');
  renderAdminAudit(document.getElementById('app-content'));
}
