-- ==============================================================================
-- KINEKIDS — SCHEMA Y SEED DATA BASE DE DATOS RELACIONAL
-- Plataforma de Evaluación de Marcha Pediátrica & Telemedicina Kinésica (Chile)
-- Cumplimiento Ley 20.584 (Derechos y Deberes) y Ley 19.628 (Datos en Salud)
-- ==============================================================================

-- 1. Tabla de Usuarios (Super Administrador, Kinesiólogos Clínicos y Padres)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    rut VARCHAR(15) UNIQUE NULL,                    -- RUT chileno canonizado ej: 18456123K
    email VARCHAR(120) UNIQUE NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Parent', 'Clinician', 'SUPER_ADMIN') NOT NULL DEFAULT 'Parent',
    status ENUM('activo', 'pendiente_validacion', 'suspendido') NOT NULL DEFAULT 'activo',
    sis_register VARCHAR(50) NULL,                  -- N° Registro Superintendencia de Salud (SIS)
    specialty VARCHAR(150) NULL,                    -- Especialidad clínica pediátrica
    phone VARCHAR(30) NULL,
    clinic_address VARCHAR(255) NULL,               -- Dirección física de consulta/box
    clinic_booking_url VARCHAR(255) NULL,           -- Enlace directo a WhatsApp / Agenda
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_identificator CHECK (rut IS NOT NULL OR email IS NOT NULL)
);

-- 2. Tabla de Fichas Pediátricas (Niños)
CREATE TABLE children (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender ENUM('Masculino', 'Femenino', 'Otro') DEFAULT 'Masculino',
    gestation_weeks TINYINT NOT NULL DEFAULT 40,    -- Semanas de gestación (<37 = prematuro)
    walk_start_months TINYINT NULL,                 -- Edad de inicio de marcha (meses)
    weight_kg DECIMAL(5, 2) NULL,                   -- Peso aproximado en kg
    height_cm DECIMAL(5, 2) NULL,                   -- Talla aproximada en cm
    medical_history TEXT NULL,                      -- Antecedentes médicos o diagnósticos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_children_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabla de Evaluaciones de Marcha (Triaje Clínico Semafórico)
CREATE TABLE evaluations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    child_id BIGINT NOT NULL,
    clinician_id BIGINT NULL,
    evaluation_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    age_years TINYINT NOT NULL,
    age_months SMALLINT NOT NULL,
    child_total_months SMALLINT NOT NULL,
    risk_level ENUM('Verde', 'Amarillo', 'Rojo') NOT NULL DEFAULT 'Verde',
    total_score INT NOT NULL DEFAULT 0,
    red_flags_count INT NOT NULL DEFAULT 0,
    
    -- Estados del flujo de derivación clínica
    status ENUM('PENDIENTE_EVALUACION', 'EN_REVISION', 'REVISADO_CON_RESPUESTA', 'REQUIERE_PRESENCIAL') DEFAULT 'PENDIENTE_EVALUACION',
    referral_status ENUM('NoRequerida', 'PendienteDerivacion', 'Derivada', 'Respondida') DEFAULT 'NoRequerida',
    parent_query TEXT NULL,                         -- Duda puntual o consulta de los padres
    notes_clinician TEXT NULL,                      -- Notas privadas del profesional con marcas de tiempo [MM:SS]
    
    -- Consentimiento Informado (Ley 20.584 / 19.628)
    consent_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    consent_timestamp TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_eval_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_clinician FOREIGN KEY (clinician_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Tabla de Evidencia Multimedia (Videos y Fotos de Marcha)
CREATE TABLE evaluation_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    evaluation_id BIGINT NOT NULL,
    tipo_archivo ENUM('FOTO', 'VIDEO') NOT NULL,
    categoria_vista ENUM('SAGITAL', 'FRONTAL', 'POSTERIOR', 'CALZADO', 'OTRO') NOT NULL DEFAULT 'SAGITAL',
    titulo_descriptivo VARCHAR(150) NULL,
    url_archivo VARCHAR(500) NOT NULL,
    nombre_archivo VARCHAR(200) NOT NULL,
    mime_type VARCHAR(80) NOT NULL,
    tamano_bytes BIGINT NOT NULL,                   -- Límite validado: máx 50 MB (52.428.800 bytes)
    duracion_segundos INT NULL,                     -- Solo para videos cortos (15 a 30 segs)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_evaluation FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
);

-- 5. Tabla de Dictamen Clínico Oficial Emitido por el Kinesiólogo
CREATE TABLE official_clinical_responses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    evaluation_id BIGINT NOT NULL UNIQUE,           -- Un dictamen oficial vinculante por caso
    clinician_id BIGINT NOT NULL,
    tipo_resolucion ENUM('NORMAL', 'OBSERVACION_TELE', 'REQUIERE_PRESENCIAL') NOT NULL,
    requiere_consulta_presencial BOOLEAN NOT NULL DEFAULT FALSE,
    mensaje_oficial_padre TEXT NOT NULL,
    indicaciones_domiciliarias TEXT NULL,           -- Pautas de estimulación y elongación en el hogar
    datos_contacto_agenda TEXT NULL,                -- Horarios, dirección de box o enlace WhatsApp
    booking_url VARCHAR(255) NULL,
    fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_verdict_eval FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    CONSTRAINT fk_verdict_clinician FOREIGN KEY (clinician_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 6. Tabla de Auditoría Clínica (Ley N° 20.584)
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NULL,
    user_name VARCHAR(120) NOT NULL DEFAULT 'Sistema',
    action VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Banco de Preguntas Clínicas Dinámicas
CREATE TABLE questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    text VARCHAR(500) NOT NULL,
    subtitle_help VARCHAR(500) NULL,
    age_min_months SMALLINT NOT NULL CHECK (age_min_months >= 0),
    age_max_months SMALLINT NOT NULL CHECK (age_max_months <= 144),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (age_min_months <= age_max_months)
);

CREATE TABLE options (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    text VARCHAR(300) NOT NULL,
    clinical_concept VARCHAR(300) NOT NULL DEFAULT '',
    risk_weight TINYINT NOT NULL DEFAULT 0,
    is_red_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ==============================================================================
-- SEED DATA MAESTRO (Contraseña por defecto: 123456789)
-- ==============================================================================
INSERT INTO users (name, rut, email, password_hash, role, status, sis_register, specialty, phone, clinic_address, clinic_booking_url)
VALUES 
    ('Super Administrador', '192019204', 'toledoordenes1920@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'SUPER_ADMIN', 'activo', NULL, NULL, '+56912345678', NULL, NULL),
    ('Dr. Matías Silva', '18456123K', 'msilva@clinica.cl', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Clinician', 'activo', '128456', 'Kinesiología Pediátrica & Biomecánica de la Marcha', '+56 9 8765 4321', 'Centro Médico Los Alerces, Av. Providencia 1240, Consulta 402, Santiago', 'https://wa.me/56987654321?text=Hola%20Dr.%20Matias%20solicito%20hora%20presencial%20KineKids'),
    ('Dra. Valentina Muñoz', '176543219', 'vmunoz@kinekids.cl', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Clinician', 'activo', '145920', 'Neurokinesiología Infantil y Tono Postural', '+56 9 7654 3210', 'Clínica Infantil San Cristóbal, Box 14, Las Condes', 'https://wa.me/56976543210'),
    ('Carolina Toledo (Madre)', '178904562', 'carolina@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Parent', 'activo', NULL, NULL, '+56965432109', NULL, NULL);
