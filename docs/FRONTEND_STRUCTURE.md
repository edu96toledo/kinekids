# docs/FRONTEND_STRUCTURE.md

## Estructura de carpetas (frontend)
```
frontend/
├─ public/                     # assets estáticos (index.html, favicon, …)
├─ src/
│   ├─ app/                    # componente raíz y configuración de rutas
│   │   └─ App.tsx             # Router, AuthGuard y RoleGuard
│   ├─ guards/                 # Protección de rutas
│   │   ├─ AuthGuard.tsx       # verifica JWT
│   │   └─ RoleGuard.tsx       # verifica rol (Parent, Clinician, SuperAdmin)
│   ├─ routes/                 # Código por “feature” (parent, clinician, superadmin)
│   │   ├─ auth/               # Login / Registro
│   │   │   ├─ Login.tsx
│   │   │   └─ Register.tsx
│   │   ├─ parent/             # Área de los padres
│   │   │   ├─ ChildrenList.tsx
│   │   │   ├─ ChildDetail.tsx
│   │   │   ├─ EvaluationWizard/   # Wizard multi‑paso
│   │   │   │   ├─ StepAge.tsx
│   │   │   │   ├─ StepQuestions.tsx   # muestra preguntas filtradas por edad
│   │   │   │   └─ Summary.tsx
│   │   │   └─ EvaluationHistory.tsx
│   │   ├─ clinician/          # Área del kinesiólogo
│   │   │   ├─ Dashboard.tsx
│   │   │   ├─ PatientList.tsx
│   │   │   ├─ EvaluationView.tsx
│   │   │   └─ NotesEditor.tsx
│   │   └─ superadmin/          # Panel de administración global
│   │       ├─ UserManagement/   # CRUD de usuarios
│   │       │   └─ UserTable.tsx
│   │       ├─ FormBuilder/      # Constructor de preguntas y opciones
│   │       │   ├─ QuestionList.tsx
│   │       │   ├─ QuestionEditor.tsx
│   │       │   └─ OptionEditor.tsx
│   │       └─ StatsPanel.tsx    # Tablero de métricas
│   ├─ components/            # Componentes reutilizables (UI, layout)
│   │   ├─ UI/                # Botones, inputs, select, date‑picker, modal, toast
│   │   └─ Layout/            # Header, Sidebar, Footer
│   ├─ services/              # Wrapper de la API con Axios
│   │   ├─ auth.ts
│   │   ├─ children.ts
│   │   ├─ evaluations.ts
│   │   └─ admin.ts
│   ├─ store/                 # Estado global con Zustand (auth, children, evaluations)
│   ├─ hooks/                 # Custom hooks (useAuth, useAge, useFormBuilder)
│   └─ main.tsx               # Punto de entrada React
├─ vite.config.ts              # Configuración de Vite
├─ tsconfig.json
└─ package.json
```

### Por qué esta organización
* **Feature‑first**: cada dominio (parent, clinician, superadmin) tiene su propio árbol, lo que facilita el escalado y la separación de responsabilidades.
* **Guards** centralizan la lógica de autorización y evitan repetición en cada ruta.
* **Componentes core** (`UI/*`) garantizan una UI consistente y reutilizable.
* **Form Builder** permite al SuperAdmin crear/editar preguntas y rangos sin redeploy; el wizard del padre consume la API `/api/forms/questions` y renderiza condicionalmente.

---
*Documento generado por Antigravity.*