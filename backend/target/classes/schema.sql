CREATE TABLE IF NOT EXISTS evaluation_project (
  id BIGSERIAL PRIMARY KEY,
  project_code VARCHAR(64) NOT NULL UNIQUE,
  project_name VARCHAR(255) NOT NULL,
  project_type VARCHAR(32) NOT NULL,
  entrusting_party VARCHAR(255),
  region_name VARCHAR(128),
  benchmark_date DATE,
  survey_date DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  remark VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT,
  deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS evaluation_party (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES evaluation_project(id),
  party_type VARCHAR(32) NOT NULL,
  party_name VARCHAR(255) NOT NULL,
  id_no VARCHAR(64),
  contact_phone VARCHAR(32),
  village_group VARCHAR(128),
  tenant_name VARCHAR(255),
  location_text VARCHAR(255),
  remark VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT,
  deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seedling_evaluation (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES evaluation_project(id),
  party_id BIGINT NOT NULL REFERENCES evaluation_party(id),
  evaluation_no VARCHAR(64) NOT NULL UNIQUE,
  benchmark_date DATE,
  survey_date DATE,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  remark VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT,
  deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seedling_evaluation_item (
  id BIGSERIAL PRIMARY KEY,
  evaluation_id BIGINT NOT NULL REFERENCES seedling_evaluation(id),
  line_no INT NOT NULL,
  seedling_name VARCHAR(128) NOT NULL,
  specification VARCHAR(128),
  unit VARCHAR(32) NOT NULL DEFAULT '株',
  quantity NUMERIC(18,4) NOT NULL DEFAULT 0,
  unit_price NUMERIC(18,2) NOT NULL DEFAULT 0,
  amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  remark VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT,
  deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS appendage_evaluation (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES evaluation_project(id),
  party_id BIGINT NOT NULL REFERENCES evaluation_party(id),
  evaluation_no VARCHAR(64) NOT NULL UNIQUE,
  tenant_name VARCHAR(255),
  location_text VARCHAR(255),
  benchmark_date DATE,
  survey_date DATE,
  structure_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  equipment_move_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  seedling_move_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  remark VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT,
  deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS appendage_evaluation_item (
  id BIGSERIAL PRIMARY KEY,
  evaluation_id BIGINT NOT NULL REFERENCES appendage_evaluation(id),
  asset_type VARCHAR(32) NOT NULL,
  asset_code VARCHAR(64),
  line_no INT NOT NULL,
  item_name VARCHAR(128) NOT NULL,
  specification VARCHAR(255),
  unit VARCHAR(32),
  quantity NUMERIC(18,4) NOT NULL DEFAULT 0,
  replacement_unit_price NUMERIC(18,2),
  replacement_amount NUMERIC(18,2),
  novelty_rate NUMERIC(18,4),
  evaluation_unit_price NUMERIC(18,2),
  evaluation_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  remark VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT,
  deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS price_library (
  id BIGSERIAL PRIMARY KEY,
  asset_category VARCHAR(32) NOT NULL,
  asset_name VARCHAR(128) NOT NULL,
  specification VARCHAR(255),
  unit VARCHAR(32),
  base_price NUMERIC(18,2) NOT NULL,
  effective_date DATE,
  expiry_date DATE,
  remark VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT,
  deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS house_evaluation (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES evaluation_project(id),
  party_id BIGINT NOT NULL REFERENCES evaluation_party(id),
  evaluation_no VARCHAR(64) NOT NULL UNIQUE,
  location_text VARCHAR(255),
  usage_type VARCHAR(64),
  building_area NUMERIC(18,4) NOT NULL DEFAULT 0,
  unit_price NUMERIC(18,2) NOT NULL DEFAULT 0,
  region_factor NUMERIC(18,4) NOT NULL DEFAULT 1,
  floor_factor NUMERIC(18,4) NOT NULL DEFAULT 1,
  orientation_factor NUMERIC(18,4) NOT NULL DEFAULT 1,
  decoration_factor NUMERIC(18,4) NOT NULL DEFAULT 1,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  benchmark_date DATE,
  survey_date DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  remark VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT,
  deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sys_user (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  real_name VARCHAR(64) NOT NULL,
  phone VARCHAR(32),
  status VARCHAR(32) NOT NULL DEFAULT 'ENABLED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by BIGINT,
  deleted SMALLINT NOT NULL DEFAULT 0
);
