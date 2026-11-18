/**
 * MODELO: RutValidator
 * Utilidades para normalización, formateo y validación de RUT chileno (Algoritmo Módulo 11)
 */

function cleanRut(rut) {
  if (typeof rut !== 'string') return '';
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

function formatRut(rut) {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return cleaned;
  const dv = cleaned.slice(-1);
  const cuerpo = cleaned.slice(0, -1);
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpoFormateado}-${dv}`;
}

function validateRut(rut) {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 8 || cleaned.length > 9) return false;
  const cuerpo = cleaned.slice(0, -1);
  const dvIngresado = cleaned.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = suma % 11;
  const dvEsperado = 11 - resto;
  let dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  return dvIngresado === dvCalculado;
}

function detectIdentifierType(input) {
  const trimmed = input.trim();
  if (!trimmed) return 'EMPTY';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'EMAIL';
  const cleaned = cleanRut(trimmed);
  if (cleaned.length >= 7 && cleaned.length <= 9) return 'RUT';
  return 'UNKNOWN';
}

function formatRutInput(input) {
  input.value = formatRut(input.value);
}
