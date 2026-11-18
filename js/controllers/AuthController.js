/**
 * CONTROLADOR: AuthController
 * Gestión de autenticación dual (RUT/Email), registro clínico con SIS y recuperación
 */

function fillAndLogin(id, pass) {
  const idInput = document.getElementById('login-identificador');
  const passInput = document.getElementById('login-password');
  if (idInput && passInput) {
    idInput.value = id;
    passInput.value = pass;
    handleIdentifierInputLive(id);
    document.getElementById('form-login')?.dispatchEvent(new Event('submit'));
  }
}

function handleRegisterRoleChange(role) {
  const clinicianFields = document.getElementById('clinician-fields');
  const regSis = document.getElementById('reg-sis');
  const regSpecialty = document.getElementById('reg-specialty');
  if (clinicianFields && regSis && regSpecialty) {
    if (role === 'Clinician') {
      clinicianFields.classList.remove('hidden');
      regSis.required = true;
      regSpecialty.required = true;
    } else {
      clinicianFields.classList.add('hidden');
      regSis.required = false;
      regSpecialty.required = false;
    }
  }
}

function handleDualLogin(e) {
  e.preventDefault();
  const rawId = document.getElementById('login-identificador')?.value.trim() || '';
  const pass = document.getElementById('login-password')?.value || '';
  const db = getDB();
  const type = detectIdentifierType(rawId);

  let userFound = null;
  if (type === 'EMAIL') {
    userFound = db.users.find(u => u.email && u.email.toLowerCase() === rawId.toLowerCase());
  } else {
    const rutClean = cleanRut(rawId);
    userFound = db.users.find(u => u.rut && cleanRut(u.rut) === rutClean);
    if (!userFound) {
      userFound = db.users.find(u => u.email && u.email.toLowerCase() === rawId.toLowerCase());
    }
  }

  if (!userFound || userFound.password !== pass) {
    showToast('Credenciales incorrectas.', 'error');
    return;
  }

  // Validación de Estado de la Cuenta
  if (userFound.status === 'pendiente_validacion') {
    showToast('Tu cuenta de Kinesiólogo está en revisión por el Super Admin (Registro SIS pendiente).', 'warning');
    return;
  }
  if (userFound.status === 'suspendido') {
    showToast('Esta cuenta se encuentra suspendida por la administración.', 'error');
    return;
  }

  setActiveSession(userFound);
  addAuditLog('LOGIN', `Inicio de sesión exitoso como ${userFound.role} (${userFound.name})`);
  showToast(`¡Bienvenido/a, ${userFound.name}!`, 'success');
  checkAuthAndRoute();
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name')?.value.trim() || '';
  const rutRaw = document.getElementById('reg-rut')?.value.trim() || '';
  const emailRaw = document.getElementById('reg-email')?.value.trim().toLowerCase() || '';
  const role = document.getElementById('reg-role')?.value || 'Parent';
  const pass = document.getElementById('reg-password')?.value || '';

  let cleanRutVal = null;
  if (rutRaw) {
    cleanRutVal = cleanRut(rutRaw);
    if (!validateRut(cleanRutVal)) {
      showToast('El RUT ingresado no es válido.', 'error');
      return;
    }
  }

  const db = getDB();
  if (db.users.some(u => u.email && u.email.toLowerCase() === emailRaw)) {
    showToast('El correo ya está registrado.', 'error');
    return;
  }
  if (cleanRutVal && db.users.some(u => u.rut && cleanRut(u.rut) === cleanRutVal)) {
    showToast('El RUT ya está registrado.', 'error');
    return;
  }

  const isClinician = role === 'Clinician';
  let sisVal = '';
  let specialtyVal = '';

  if (isClinician) {
    sisVal = document.getElementById('reg-sis')?.value.trim() || '';
    specialtyVal = document.getElementById('reg-specialty')?.value.trim() || '';
    if (!sisVal) {
      showToast('Debe ingresar su N° de Registro en la Superintendencia de Salud.', 'error');
      return;
    }
  }

  const newUser = {
    id: Date.now(),
    name,
    rut: cleanRutVal,
    email: emailRaw,
    password: pass,
    role: role,
    status: isClinician ? 'pendiente_validacion' : 'activo',
    sisRegister: sisVal || null,
    specialty: specialtyVal || (isClinician ? 'Kinesiología Pediátrica' : null),
    clinicAddress: isClinician ? 'Consulta Clínica Pediátrica' : null
  };

  db.users.push(newUser);
  saveDB(db);

  addAuditLog('REGISTRO_USUARIO', `Nuevo usuario registrado: ${name} (${role})${isClinician ? ' - SIS: ' + sisVal + ' [Pendiente Aprobación]' : ''}`);

  if (isClinician) {
    showToast('¡Registro completado! Tu cuenta quedó en revisión hasta la aprobación de tu SIS.', 'info');
    switchAuthTab('login');
  } else {
    setActiveSession(newUser);
    showToast('¡Cuenta creada exitosamente!', 'success');
    checkAuthAndRoute();
  }
}

function handleForgotPassword(e) {
  e.preventDefault();
  const val = document.getElementById('recover-identifier')?.value.trim() || '';
  addAuditLog('RECUPERACION_PASSWORD', `Solicitud de restablecimiento para: ${val}`);
  closeModal();
  showToast('Si los datos coinciden con un usuario registrado, recibirás un enlace de recuperación.', 'info');
}
