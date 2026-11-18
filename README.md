# KineKids — Plataforma de Evaluación de Marcha Pediátrica & Telemedicina Kinésica

Plataforma web clínica especializada en triaje biomecánico de marcha infantil (0 a 12 años), análisis audiovisual cuadro a cuadro, emisión de dictámenes oficiales y gestión de consultas presenciales en Chile, bajo cumplimiento de la **Ley N° 20.584** (Derechos y Deberes del Paciente) y **Ley N° 19.628** (Protección de Datos Personales en Salud).

---

## 📂 Organización por Tipo de Archivo / Tecnología

El proyecto se encuentra organizado en carpetas dedicadas según la tecnología y tipo de archivo (`.html`, `.css`, `.js`, `.sql`, imágenes):

```text
proyecto anto/
│
├── html/                       # Archivos HTML (.html)
│   └── index.html              # Interfaz y esqueleto principal de la plataforma
│
├── css/                        # Archivos de Hojas de Estilo (.css)
│   └── styles.css              # Estilos personalizados, scrollbars y reglas @media print
│
├── js/                         # Archivos JavaScript (.js) organizados en MVC
│   ├── models/                 # Modelos de datos y algoritmos clínicos
│   │   ├── DatabaseModel.js    # Capa de almacenamiento y datos maestros
│   │   ├── QuestionsModel.js   # Banco de 10 preguntas y conceptos clínicos
│   │   ├── TriageModel.js      # Motor de triaje semafórico y edad corregida
│   │   ├── RutValidator.js     # Validador Módulo 11 y formato de RUT
│   │   └── AuditModel.js       # Log de auditoría clínica (Ley 20.584)
│   │
│   ├── views/                  # Vistas y componentes de pantalla
│   │   ├── HeaderView.js       # Barra superior de navegación y perfil
│   │   ├── AuthView.js         # Vistas de Login Dual, Registro y Recuperación
│   │   ├── ParentView.js       # Vistas de Padres (Fichas, Wizard, Multimedia)
│   │   ├── ClinicianView.js    # Vistas de Kinesiólogo (Bandeja, Visor y Dictamen)
│   │   ├── AdminView.js        # Vistas de Super Admin (Gobernanza y Auditoría)
│   │   ├── ReportView.js       # Generador de Informe Clínico Oficial en PDF
│   │   └── ModalView.js        # Modales dinámicos y notificaciones Toast
│   │
│   ├── controllers/            # Controladores de eventos e interacción
│   │   ├── AppController.js    # Enrutador principal y control de sesión
│   │   ├── AuthController.js   # Controlador de autenticación y registro
│   │   ├── ChildController.js  # Controlador de fichas pediátricas y borrado
│   │   ├── EvaluationController.js # Controlador de cuestionario y multimedia
│   │   ├── ClinicianController.js  # Controlador de casos, velocidad video y dictamen
│   │   └── AdminController.js  # Controlador de validación SIS de profesionales
│   │
│   └── app.js                  # Inicializador y arranque de la aplicación
│
├── sql/                        # Scripts de Base de Datos Relacional (.sql)
│   ├── schema.sql              # Definición de tablas DDL y Seed Data inicial
│   └── diagram.md              # Documentación y diagrama entidad-relación
│
├── img/                        # Recursos de Imagen (.jpg, .png)
│   └── kinekids-logo.jpg       # Logotipo oficial de KineKids
│
├── run-app.bat                 # Lanzador de escritorio para apertura inmediata
├── index.html                  # Acceso directo en la raíz para navegadores
└── README.md                   # Documentación general del proyecto
```

---

## 👥 Cuentas de Demostración (Seed Data)

Contraseña por defecto para todas las cuentas: `123456789`

| Rol | Identificador (RUT o Correo) | Características |
|---|---|---|
| **Kinesiólogo Clínico** | `18.456.123-K` ó `msilva@clinica.cl` | Dr. Matías Silva (Reg. SIS 128456). Visor de video cuadro a cuadro (±0.033s), velocidades 0.25x/0.5x, marcas de tiempo y dictámenes oficiales. |
| **Padre / Tutor** | `carolina@gmail.com` | Carolina Toledo. Fichas con semanas de gestación/prematurez, videos sagital/frontal con límite de 50MB, consentimiento informado y descarga de informes PDF. |
| **Super Administrador** | `toledoordenes1920@gmail.com` | Validación de Kinesiólogos ante la Superintendencia de Salud (SIS) y registro de auditoría clínica en tiempo real. |

---

## 🚀 Cómo Abrir la Aplicación

- **Doble clic en `run-app.bat`**: Abre inmediatamente la aplicación en tu navegador web predeterminado.
- **Directo en el navegador**: Puedes abrir `index.html` (desde la raíz o desde `html/index.html`).
