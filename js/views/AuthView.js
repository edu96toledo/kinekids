/**
 * VISTA: AuthView
 * Renderizado de formulario de Login Dual, Registro de Kinesiólogos/Padres y Recuperación
 */

function renderLoginView() {
  const content = document.getElementById('app-content');
  if (!content) return;

  content.innerHTML = `
    <div class="max-w-md w-full mx-auto my-6">
      <div class="text-center mb-8">
        <div class="inline-flex w-20 h-20 rounded-3xl overflow-hidden shadow-xl shadow-teal-500/25 mb-3 border border-slate-100">
          <img src="img/icon-192x192.png" onerror="this.src='kinekids-logo.jpg'" alt="KineKids" class="w-full h-full object-cover">
        </div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">KineKids</h2>
        <p class="text-xs text-slate-500 mt-1">Evaluación de Marcha Pediátrica • Telemedicina Kinésica</p>
        
        <!-- Botón de Instalación App Directa -->
        <div class="mt-4 flex justify-center">
          <button type="button" onclick="triggerPWAInstall()" class="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg shadow-teal-600/30 transition transform hover:scale-105 active:scale-95 cursor-pointer">
            <i class="fa-solid fa-download"></i>
            <span>Instalar como Aplicación</span>
            <span class="bg-white/20 text-[10px] px-2 py-0.5 rounded-full ml-1 font-semibold">PWA</span>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div class="flex border-b border-slate-200 mb-6 text-sm font-bold">
          <button id="tab-btn-login" onclick="switchAuthTab('login')" class="flex-1 pb-3 text-teal-700 border-b-2 border-teal-600">
            Iniciar Sesión
          </button>
          <button id="tab-btn-register" onclick="switchAuthTab('register')" class="flex-1 pb-3 text-slate-400 hover:text-slate-600 border-b-2 border-transparent">
            Crear Cuenta
          </button>
        </div>

        <!-- Formulario Login Dual -->
        <form id="form-login" onsubmit="handleDualLogin(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              RUT o Correo Electrónico
            </label>
            <div class="relative">
              <input type="text" id="login-identificador" required autocomplete="username"
                     oninput="handleIdentifierInputLive(this.value)"
                     placeholder="Ej: 19.201.920-4 o correo@ejemplo.com"
                     class="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i class="fa-solid fa-id-card"></i>
              </div>
            </div>
            <div id="identifier-detector-badge" class="mt-1.5 text-[11px] font-semibold text-slate-400 flex items-center min-h-[18px]">
              <span>Ingresa tu RUT chileno con dígito verificador o Email</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div class="relative">
              <input type="password" id="login-password" required autocomplete="current-password"
                     placeholder="•••••••••"
                     class="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i class="fa-solid fa-lock"></i>
              </div>
            </div>
            <div class="text-right mt-1.5">
              <button type="button" onclick="openForgotPasswordModal()" class="text-xs text-teal-600 hover:text-teal-800 font-semibold transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <button type="submit" class="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-lg shadow-teal-500/25 transition-all mt-2">
            Ingresar a la Plataforma
          </button>
        </form>

        <!-- Formulario de Registro con Validación Clínica -->
        <form id="form-register" onsubmit="handleRegister(event)" class="space-y-4 hidden">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre Completo</label>
            <input type="text" id="reg-name" required placeholder="Ej: Patricia Morales" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">RUT Chileno</label>
            <input type="text" id="reg-rut" oninput="formatRutInput(this)" placeholder="12.345.678-9" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Correo Electrónico</label>
            <input type="email" id="reg-email" required placeholder="correo@ejemplo.com" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none">
          </div>

          <!-- Selector de Rol con Fix de Z-Index y Espaciado -->
          <div class="relative z-20">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tipo de Usuario (Rol)</label>
            <select id="reg-role" onchange="handleRegisterRoleChange(this.value)" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white">
              <option value="Parent">Padre / Tutor</option>
              <option value="Clinician">Kinesiólogo / Profesional Clínico</option>
            </select>
          </div>

          <!-- Campos Clínicos Dinámicos para Kinesiólogo -->
          <div id="clinician-fields" class="hidden p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
            <div class="flex items-center space-x-2 text-teal-800 text-xs font-bold">
              <i class="fa-solid fa-user-doctor"></i>
              <span>Validación de Profesional de la Salud</span>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                N° Registro Superintendencia de Salud (SIS) *
              </label>
              <input type="text" id="reg-sis" placeholder="Ej: 145920" class="w-full px-3 py-2 rounded-xl border border-teal-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none">
              <span class="text-[10px] text-teal-700 mt-0.5 block">Requerido para verificación oficial ante el MINSAL</span>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Especialidad / Centro Clínico *
              </label>
              <input type="text" id="reg-specialty" placeholder="Ej: Kinesiología Pediátrica • Hospital Clínico" class="w-full px-3 py-2 rounded-xl border border-teal-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none">
            </div>
            <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-tight">
              <i class="fa-solid fa-circle-info mr-1"></i> Tu cuenta quedará en estado <b>pendiente de validación</b> hasta que el Super Admin confirme tus credenciales en el registro SIS.
            </div>
          </div>

          <div class="relative z-10 pt-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contraseña</label>
            <input type="password" id="reg-password" required minlength="6" placeholder="Mínimo 6 caracteres" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none">
          </div>

          <button type="submit" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition-all">
            Crear Mi Cuenta
          </button>
        </form>

        <!-- Accesos de Demostración con 1 Clic -->
        <div class="mt-8 pt-6 border-t border-slate-100">
          <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            <i class="fa-solid fa-bolt text-amber-500 mr-1"></i> Accesos de Demostración con 1 Clic
          </span>
          <div class="space-y-2">
            <button type="button" onclick="fillAndLogin('18.456.123-K', '123456789')"
                    class="w-full p-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-2xl text-left flex items-center justify-between text-xs transition-colors">
              <div>
                <span class="font-bold text-teal-900 block">🩺 Kinesiólogo (Dr. Matías Silva)</span>
                <span class="text-teal-700 text-[11px]">Visor cuadro a cuadro, marcas de tiempo y dictamen</span>
              </div>
              <span class="text-teal-600 font-bold text-[10px] bg-teal-200/60 px-2 py-0.5 rounded">Entrar</span>
            </button>

            <button type="button" onclick="fillAndLogin('carolina@gmail.com', '123456789')"
                    class="w-full p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl text-left flex items-center justify-between text-xs transition-colors">
              <div>
                <span class="font-bold text-blue-900 block">👨‍👧 Madre (Carolina Toledo)</span>
                <span class="text-blue-700 text-[11px]">Subir videos con guía sagital/frontal y consentimiento</span>
              </div>
              <span class="text-blue-600 font-bold text-[10px] bg-blue-200/60 px-2 py-0.5 rounded">Entrar</span>
            </button>

            <button type="button" onclick="fillAndLogin('toledoordenes1920@gmail.com', '123456789')"
                    class="w-full p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl text-left flex items-center justify-between text-xs transition-colors">
              <div>
                <span class="font-bold text-purple-900 block">👑 Super Administrador</span>
                <span class="text-purple-700 text-[11px]">Validación SIS de Kinesiólogos y Registro de Auditoría</span>
              </div>
              <span class="text-purple-600 font-bold text-[10px] bg-purple-200/60 px-2 py-0.5 rounded">Entrar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('form-login');
  const regForm = document.getElementById('form-register');
  const tabLogin = document.getElementById('tab-btn-login');
  const tabReg = document.getElementById('tab-btn-register');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    tabLogin.className = "flex-1 pb-3 text-teal-700 border-b-2 border-teal-600 font-bold";
    tabReg.className = "flex-1 pb-3 text-slate-400 hover:text-slate-600 border-b-2 border-transparent font-bold";
  } else {
    loginForm.classList.add('hidden');
    regForm.classList.remove('hidden');
    tabLogin.className = "flex-1 pb-3 text-slate-400 hover:text-slate-600 border-b-2 border-transparent font-bold";
    tabReg.className = "flex-1 pb-3 text-teal-700 border-b-2 border-teal-600 font-bold";
  }
}

function handleIdentifierInputLive(val) {
  const badge = document.getElementById('identifier-detector-badge');
  if (!badge) return;
  const trimmed = val.trim();
  if (!trimmed) {
    badge.innerHTML = '<span>Ingresa tu RUT chileno con dígito verificador o Email</span>';
    badge.className = "mt-1.5 text-[11px] font-semibold text-slate-400 flex items-center min-h-[18px]";
    return;
  }
  const type = detectIdentifierType(trimmed);
  if (type === 'EMAIL') {
    badge.innerHTML = '<span class="text-teal-600 flex items-center"><i class="fa-solid fa-envelope mr-1.5"></i> Formato Correo Electrónico válido</span>';
  } else if (type === 'RUT') {
    const isValid = validateRut(trimmed);
    if (isValid) {
      badge.innerHTML = `<span class="text-emerald-600 flex items-center"><i class="fa-solid fa-id-card-clip mr-1.5"></i> RUT Chileno Válido (${formatRut(trimmed)})</span>`;
    } else {
      badge.innerHTML = '<span class="text-rose-500 flex items-center"><i class="fa-solid fa-triangle-exclamation mr-1.5"></i> RUT: Dígito verificador no coincide</span>';
    }
  } else {
    badge.innerHTML = '<span class="text-amber-500 flex items-center"><i class="fa-solid fa-magnifying-glass mr-1.5"></i> Escribiendo RUT o Email...</span>';
  }
}

function openForgotPasswordModal() {
  const modal = document.getElementById('modal-container');
  const card = document.getElementById('modal-card');
  if (!modal || !card) return;

  card.innerHTML = `
    <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
      <div class="flex items-center space-x-2 text-teal-700">
        <i class="fa-solid fa-key text-lg"></i>
        <h3 class="text-base font-bold text-slate-900">Recuperación de Contraseña</h3>
      </div>
      <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark text-lg"></i></button>
    </div>
    <form onsubmit="handleForgotPassword(event)" class="space-y-4">
      <p class="text-xs text-slate-600 leading-relaxed">
        Ingresa el correo electrónico o RUT asociado a tu cuenta de KineKids. Te enviaremos instrucciones seguras para restablecer tu acceso.
      </p>
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Correo o RUT</label>
        <input type="text" id="recover-identifier" required placeholder="correo@ejemplo.com o 12.345.678-9" 
               class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
      </div>
      <div class="flex justify-end space-x-2 pt-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Cancelar</button>
        <button type="submit" class="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
          Enviar Instrucciones
        </button>
      </div>
    </form>
  `;
  modal.classList.remove('hidden');
}
