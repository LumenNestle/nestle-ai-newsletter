-- ========================================
-- FOUNDATIONAL SEED - RBAC + AREAS + USERS
-- + FONT GROUPS + BRAND KITS + TEMPLATE STATES + EXPORT TYPES
-- ========================================

-- ========================================
-- PERMISSION CATEGORIES
-- ========================================

INSERT INTO public.permission_categories (code, name) VALUES
('ACCESS_MANAGEMENT', 'Gestion de Accesos'),
('CONFIGURATION', 'Configuracion'),
('TEMPLATES', 'Plantillas'),
('CONTENT', 'Contenido'),
('REVIEW', 'Revision'),
('TRACEABILITY', 'Trazabilidad')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name;

-- ========================================
-- PERMISSIONS
-- ========================================

INSERT INTO public.permissions (category_id, code, description)
SELECT pc.id, v.code, v.description
FROM (
  VALUES
    ('ACCESS_MANAGEMENT', 'USER_MANAGE', 'Alta/Baja de usuarios'),
    ('ACCESS_MANAGEMENT', 'ROLE_ASSIGN', 'Asignacion de roles'),
    ('ACCESS_MANAGEMENT', 'SECURITY_POLICY_DEFINE', 'Definicion de politicas de seguridad y acceso'),

    ('CONFIGURATION', 'PROMPT_MANAGE', 'Backoffice y gestion de Prompts de IA'),
    ('CONFIGURATION', 'BRAND_MANAGE', 'Gestion de estilos de marca'),

    ('TEMPLATES', 'TEMPLATE_CREATE_RETIRE', 'Creacion y retiro de templates corporativos'),
    ('TEMPLATES', 'TEMPLATE_EDIT', 'Edicion de templates'),
    ('TEMPLATES', 'TEMPLATE_VIEW_COPY', 'Ver y copiar templates existentes'),

    ('CONTENT', 'CONTENT_GENERATE_AI', 'Generacion de contenido via IA'),
    ('CONTENT', 'CONTENT_UPLOAD', 'Carga de contenido y archivos'),
    ('CONTENT', 'CONTENT_EXPORT_APPROVED', 'Exportacion de contenidos aprobados'),

    ('REVIEW', 'REVIEW_REQUEST_PREVIEW', 'Solicitud de revision y previsualizacion'),
    ('REVIEW', 'REVIEW_COMMENT_CREATE', 'Crear comentarios de revision'),
    ('REVIEW', 'REVIEW_COMMENT_VIEW_REPLY', 'Ver y responder a comentarios de revision'),
    ('REVIEW', 'REVIEW_FINAL_APPROVE_COMMENT', 'Aprobacion final y comentarios'),

    ('TRACEABILITY', 'AUDIT_LOGS_METRICS_VIEW', 'Logs de auditoria y metricas de uso')
) AS v(category_code, code, description)
JOIN public.permission_categories pc
  ON pc.code = v.category_code
ON CONFLICT (code) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  description = EXCLUDED.description;

-- ========================================
-- ROLE PERMISSIONS
-- ========================================

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'ADMIN'::user_role, id
FROM public.permissions
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'FUNCTIONAL'::user_role, id
FROM public.permissions
WHERE code IN (
  'ROLE_ASSIGN',
  'TEMPLATE_EDIT',
  'TEMPLATE_VIEW_COPY',
  'CONTENT_UPLOAD',
  'CONTENT_EXPORT_APPROVED',
  'REVIEW_REQUEST_PREVIEW',
  'REVIEW_COMMENT_CREATE',
  'REVIEW_COMMENT_VIEW_REPLY',
  'REVIEW_FINAL_APPROVE_COMMENT',
  'AUDIT_LOGS_METRICS_VIEW'
)
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'USER'::user_role, id
FROM public.permissions
WHERE code IN (
  'CONTENT_GENERATE_AI',
  'CONTENT_UPLOAD',
  'CONTENT_EXPORT_APPROVED',
  'REVIEW_REQUEST_PREVIEW',
  'REVIEW_COMMENT_VIEW_REPLY'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- ========================================
-- AREAS
-- ========================================

INSERT INTO public.areas (name) VALUES
('COMUNICACION_INTERNA'::area_name),
('COMUNICACION_CORPORATIVA'::area_name)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- TEST USERS
-- ========================================

INSERT INTO public.users (
  name,
  last_name,
  email,
  area_id,
  role,
  state
)
SELECT
  v.name,
  v.last_name,
  v.email,
  a.id,
  v.role::user_role,
  'ACTIVE'::user_state
FROM (
  VALUES
    ('Admin', 'Local', 'admin@local.test', 'COMUNICACION_INTERNA', 'ADMIN'),
    ('Functional', 'Local', 'functional@local.test', 'COMUNICACION_INTERNA', 'FUNCTIONAL'),
    ('User', 'Local', 'user@local.test', 'COMUNICACION_CORPORATIVA', 'USER')
) AS v(name, last_name, email, area_name, role)
JOIN public.areas a
  ON a.name = v.area_name::area_name
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  last_name = EXCLUDED.last_name,
  area_id = EXCLUDED.area_id,
  role = EXCLUDED.role,
  state = EXCLUDED.state;

-- ========================================
-- FONT GROUPS
-- ========================================

INSERT INTO public.font_groups (name)
VALUES
  ('Nestle'),
  ('Purina'),
  ('Kit Kat'),
  ('Maggi'),
  ('Nescafe'),
  ('Nescau'),
  ('Nespresso'),
  ('Milo'),
  ('Nido'),
  ('Perrier'),
  ('San Pellegrino'),
  ('Gerber'),
  ('Carnation'),
  ('Nestle Classic'),
  ('Nestle Health Science')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- EXPORT TYPES
-- ========================================

INSERT INTO public.export_types (code, name)
VALUES
  ('HTML', 'HTML'),
  ('PDF', 'PDF'),
  ('MJML', 'MJML')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name;

-- ========================================
-- TEMPLATE STATES
-- ========================================

INSERT INTO public.template_states (code, name)
VALUES
  ('DRAFT', 'Borrador'),
  ('ACTIVE', 'Activa'),
  ('RETIRED', 'Retirada')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name;

-- ========================================
-- BRAND KITS
-- ========================================

WITH desired_brand_kits AS (
  SELECT
    v.name,
    fg.id AS font_group_id
  FROM (
    VALUES
      ('Nestle'),
      ('Purina'),
      ('Kit Kat'),
      ('Maggi'),
      ('Nescafe'),
      ('Nescau'),
      ('Nespresso'),
      ('Milo'),
      ('Nido'),
      ('Perrier'),
      ('San Pellegrino'),
      ('Gerber'),
      ('Carnation'),
      ('Nestle Classic'),
      ('Nestle Health Science')
  ) AS v(name)
  LEFT JOIN public.font_groups fg
    ON fg.name = v.name
)
UPDATE public.brand_kit bk
SET
  font_group_id = d.font_group_id,
  active = true,
  deleted_at = NULL,
  updated_at = now()
FROM desired_brand_kits d
WHERE bk.name = d.name;

WITH desired_brand_kits AS (
  SELECT
    v.name,
    fg.id AS font_group_id
  FROM (
    VALUES
      ('Nestle'),
      ('Purina'),
      ('Kit Kat'),
      ('Maggi'),
      ('Nescafe'),
      ('Nescau'),
      ('Nespresso'),
      ('Milo'),
      ('Nido'),
      ('Perrier'),
      ('San Pellegrino'),
      ('Gerber'),
      ('Carnation'),
      ('Nestle Classic'),
      ('Nestle Health Science')
  ) AS v(name)
  LEFT JOIN public.font_groups fg
    ON fg.name = v.name
)
INSERT INTO public.brand_kit (name, font_group_id, active)
SELECT d.name, d.font_group_id, true
FROM desired_brand_kits d
WHERE NOT EXISTS (
  SELECT 1
  FROM public.brand_kit bk
  WHERE bk.name = d.name
);
