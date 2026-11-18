# docs/API_ENDPOINTS.md

## Resumen de Endpoints REST (Backend)

| Método | Ruta | Descripción | Roles Permitidos |
|---|---|---|---|
| **POST** | `/api/auth/register` | Registro de usuario (Padre o Kinesiólogo). El campo `role` debe ser `Parent` o `Clinician`. | **SuperAdmin** (para crear Clinician) y **Parent** (auto‑registro) |
| **POST** | `/api/auth/login` | Login → devuelve JWT. | Todos |
| **GET** | `/api/children` | Lista los niños del padre autenticado. | **Parent** |
| **POST** | `/api/children` | Crea perfil de niño (valida ≤ 12 años). | **Parent** |
| **GET** | `/api/children/:id` | Detalle del niño + edad calculada. | **Parent** (propio) o **Clinician** (si se le asigna) |
| **PUT** | `/api/children/:id` | Edita nombre y/o fecha de nacimiento (vuelve a validar edad). | **Parent** |
| **DELETE** | `/api/children/:id` | Elimina perfil de niño. | **Parent** |
| **POST** | `/api/evaluations` | Crea evaluación (padre envía `childId` y arreglo de `answers`). Calcula edad y guarda respuestas. | **Parent** |
| **GET** | `/api/evaluations` | Listado de evaluaciones (filtrable por `childId`). Padres solo ven sus hijos; Clinicians ven los que les fueron asignados. | **Parent**, **Clinician** |
| **GET** | `/api/evaluations/:id` | Detalle completo (preguntas, respuestas, notas). | **Parent** (propio) o **Clinician** (asignado) |
| **PATCH** | `/api/evaluations/:id/notes` | Añade o actualiza notas clínicas. | **Clinician** |
| **GET** | `/api/forms/questions?childId=XYZ` | Devuelve solo las preguntas cuya edad mínima/máxima cubre la edad del niño. Incluye sus opciones. | **Parent**, **Clinician**, **SuperAdmin** |
| **POST** | `/api/admin/users` | Crear usuario (Parent o Clinician). | **SuperAdmin** |
| **GET** | `/api/admin/users` | Listar usuarios (opcional filtro por `role`). | **SuperAdmin** |
| **PUT** | `/api/admin/users/:id` | Editar datos de usuario, cambiar rol, o actualizar contraseña. | **SuperAdmin** |
| **DELETE** | `/api/admin/users/:id` | Eliminar usuario. | **SuperAdmin** |
| **POST** | `/api/admin/questions` | Crear pregunta dinámica con rangos de edad. | **SuperAdmin** |
| **GET** | `/api/admin/questions` | Listar todas las preguntas (opcional filtro `active`). | **SuperAdmin** |
| **PUT** | `/api/admin/questions/:id` | Editar texto, rangos, estado activo. | **SuperAdmin** |
| **DELETE** | `/api/admin/questions/:id` | Eliminar pregunta (cascada a sus opciones). | **SuperAdmin** |
| **POST** | `/api/admin/questions/:questionId/options` | Crear opción para una pregunta. | **SuperAdmin** |
| **PUT** | `/api/admin/options/:id` | Editar opción. | **SuperAdmin** |
| **DELETE** | `/api/admin/options/:id` | Eliminar opción. | **SuperAdmin** |
| **GET** | `/api/admin/stats` | Estadísticas globales (usuarios por rol, total de niños, total de evaluaciones). | **SuperAdmin** |

### Notas de seguridad
* Cada ruta utiliza `requireAuth` para validar el JWT.
* `requireRole([...])` restringe el acceso a los roles indicados.
* Los padres solo pueden operar sobre sus propios `children` y `evaluations`.
* Los clínicos pueden leer evaluaciones asignadas y añadir notas.
* El SuperAdmin tiene acceso total a CRUD de preguntas, opciones, usuarios y estadísticas.

---
*Documento generado por Antigravity.*