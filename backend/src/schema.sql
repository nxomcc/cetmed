CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  name VARCHAR(255),
  mime_type VARCHAR(100),
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icono VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cursos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  descripcion TEXT,
  objetivo TEXT,
  contenidos JSONB,
  precio DECIMAL(12,2) DEFAULT 0,
  horas INTEGER,
  modalidad VARCHAR(50) DEFAULT 'Presencial',
  nivel VARCHAR(50) DEFAULT 'Básico-Intermedio',
  franquicia_sence BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  vistas INTEGER DEFAULT 0,
  imagen_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noticias (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  resumen TEXT,
  contenido TEXT,
  published_at TIMESTAMPTZ,
  vistas INTEGER DEFAULT 0,
  imagen_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS descuentos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(100) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'porcentaje',
  valor DECIMAL(12,2) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_expiracion TIMESTAMPTZ,
  limite_usos INTEGER,
  usos_actuales INTEGER DEFAULT 0,
  descripcion VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  nombre_cliente VARCHAR(255),
  email_cliente VARCHAR(255),
  telefono_cliente VARCHAR(50),
  items JSONB,
  subtotal DECIMAL(12,2) DEFAULT 0,
  descuento_monto DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  codigo_descuento VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'pendiente',
  payment_id VARCHAR(255),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(50),
  mensaje TEXT,
  leido BOOLEAN DEFAULT FALSE,
  rut VARCHAR(50),
  empresa VARCHAR(255),
  tipo VARCHAR(100),
  area VARCHAR(100),
  curso_id INTEGER REFERENCES cursos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'editor',
  blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
