/**
 * Validador y formateador de RUT Chileno (Algoritmo Módulo 11)
 */

/**
 * Limpia el RUT quitando puntos, guiones y espacios, convirtiendo a mayúsculas.
 * Ej: " 19.201.920-k " -> "19201920K"
 */
export function cleanRut(rut: string): string {
  if (typeof rut !== "string") return "";
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

/**
 * Formatea un RUT limpio o sucio al formato estándar 12.345.678-K
 */
export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return cleaned;
  
  const dv = cleaned.slice(-1);
  const cuerpo = cleaned.slice(0, -1);
  
  // Agregar puntos al cuerpo
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpoFormateado}-${dv}`;
}

/**
 * Valida un RUT chileno usando el algoritmo Módulo 11
 */
export function validateRut(rut: string): boolean {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 8 || cleaned.length > 9) return false;

  const cuerpo = cleaned.slice(0, -1);
  const dvIngresado = cleaned.slice(-1);

  // El cuerpo debe ser estrictamente numérico
  if (!/^\d+$/.test(cuerpo)) return false;

  // Cálculo Módulo 11
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dvEsperado = 11 - resto;

  let dvCalculado = "";
  if (dvEsperado === 11) {
    dvCalculado = "0";
  } else if (dvEsperado === 10) {
    dvCalculado = "K";
  } else {
    dvCalculado = dvEsperado.toString();
  }

  return dvIngresado === dvCalculado;
}

/**
 * Determina si una cadena ingresada es un Email o un RUT
 */
export function detectIdentifierType(input: string): "EMAIL" | "RUT" | "INVALID" {
  const trimmed = input.trim();
  if (!trimmed) return "INVALID";

  // Verificación básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) {
    return "EMAIL";
  }

  // Verificación de RUT (si contiene caracteres de RUT y cumple longitud mínima)
  const cleaned = cleanRut(trimmed);
  if (cleaned.length >= 7 && cleaned.length <= 9) {
    return "RUT";
  }

  return "INVALID";
}
