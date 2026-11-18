/**
 * VISTA: ModalView
 * Gestión de modales emergentes y notificaciones toast dinámicas
 */

function closeModal() {
  const modal = document.getElementById('modal-container');
  if (modal) modal.classList.add('hidden');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  const colors = type === 'success' 
    ? 'bg-emerald-600 text-white' 
    : type === 'warning' 
    ? 'bg-amber-600 text-white' 
    : type === 'info' 
    ? 'bg-slate-800 text-white' 
    : 'bg-rose-600 text-white';
  
  toast.className = `${colors} px-4 py-3 rounded-2xl shadow-xl text-xs font-bold transition-all transform translate-y-2 opacity-0 flex items-center space-x-2 pointer-events-auto`;
  toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
