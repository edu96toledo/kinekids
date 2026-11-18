/**
 * CONTROLADOR: ChildController
 * Lógica de negocio para registro pediátrico, antecedentes y eliminación segura de fichas
 */

function handleCreateChild(e) {
  e.preventDefault();
  const name = document.getElementById('new-child-name')?.value.trim() || '';
  const gender = document.getElementById('new-child-gender')?.value || 'Masculino';
  const birthDate = document.getElementById('new-child-dob')?.value || '';
  const gestationWeeks = parseInt(document.getElementById('new-child-gestation')?.value, 10) || 40;
  const walkStartMonths = parseInt(document.getElementById('new-child-walk')?.value, 10) || null;
  const weightKg = parseFloat(document.getElementById('new-child-weight')?.value) || null;
  const heightCm = parseFloat(document.getElementById('new-child-height')?.value) || null;
  const medicalHistory = document.getElementById('new-child-history')?.value.trim() || '';

  const age = calculateExactAge(birthDate, gestationWeeks);
  if (!age.isValid) {
    showToast('Error: La plataforma está diseñada exclusivamente para marcha pediátrica hasta los 12 años.', 'error');
    return;
  }

  const db = getDB();
  const newChild = {
    id: Date.now(),
    parentId: currentUser.id,
    name,
    gender,
    birthDate,
    gestationWeeks,
    walkStartMonths,
    weightKg,
    heightCm,
    medicalHistory
  };

  db.children.push(newChild);
  saveDB(db);

  addAuditLog('CREAR_FICHA', `Ficha pediátrica creada para: ${name} (Nac: ${birthDate}, ${gestationWeeks} sem)`);
  closeModal();
  showToast('Ficha pediátrica registrada exitosamente', 'success');
  navigateTo('parent-children');
}

function deleteChildConfirmed(id) {
  const db = getDB();
  const child = db.children.find(c => c.id === id);
  const childName = child ? child.name : 'Niño';

  db.children = db.children.filter(c => c.id !== id);
  db.evaluations = db.evaluations.filter(e => e.childId !== id);
  saveDB(db);

  addAuditLog('ELIMINAR_FICHA', `Ficha pediátrica eliminada: ${childName} (ID: ${id})`);
  closeModal();
  showToast('Ficha clínica y evaluaciones eliminadas', 'info');
  navigateTo('parent-children');
}
