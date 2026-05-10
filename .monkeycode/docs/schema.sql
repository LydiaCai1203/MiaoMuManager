CREATE TABLE sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  real_name VARCHAR(64) NOT NULL,
  phone VARCHAR(32) DEFAULT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ENABLED',
  last_login_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_sys_user_username (username)
);

CREATE TABLE sys_role (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_code VARCHAR(64) NOT NULL,
  role_name VARCHAR(64) NOT NULL,
  remark VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_sys_role_code (role_code)
);

CREATE TABLE sys_permission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  permission_code VARCHAR(128) NOT NULL,
  permission_name VARCHAR(128) NOT NULL,
  permission_type VARCHAR(32) NOT NULL,
  parent_id BIGINT DEFAULT NULL,
  path VARCHAR(255) DEFAULT NULL,
  method VARCHAR(16) DEFAULT NULL,
  sort_no INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_sys_permission_code (permission_code)
);

CREATE TABLE sys_user_role (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_sys_user_role (user_id, role_id)
);

CREATE TABLE sys_role_permission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT NOT NULL,
  permission_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_sys_role_permission (role_id, permission_id)
);

CREATE TABLE evaluation_project (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_code VARCHAR(64) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  project_type VARCHAR(32) NOT NULL,
  entrusting_party VARCHAR(255) DEFAULT NULL,
  region_name VARCHAR(128) DEFAULT NULL,
  benchmark_date DATE DEFAULT NULL,
  survey_date DATE DEFAULT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  remark VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_evaluation_project_code (project_code),
  KEY idx_evaluation_project_name (project_name)
);

CREATE TABLE evaluation_party (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  party_type VARCHAR(32) NOT NULL,
  party_name VARCHAR(255) NOT NULL,
  id_no VARCHAR(64) DEFAULT NULL,
  contact_phone VARCHAR(32) DEFAULT NULL,
  village_group VARCHAR(128) DEFAULT NULL,
  tenant_name VARCHAR(255) DEFAULT NULL,
  location_text VARCHAR(255) DEFAULT NULL,
  remark VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_evaluation_party_project_id (project_id),
  KEY idx_evaluation_party_name (party_name)
);

CREATE TABLE seedling_evaluation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  party_id BIGINT NOT NULL,
  evaluation_no VARCHAR(64) NOT NULL,
  benchmark_date DATE DEFAULT NULL,
  survey_date DATE DEFAULT NULL,
  total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  remark VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_seedling_evaluation_no (evaluation_no),
  KEY idx_seedling_evaluation_project_id (project_id),
  KEY idx_seedling_evaluation_party_id (party_id)
);

CREATE TABLE seedling_evaluation_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  evaluation_id BIGINT NOT NULL,
  line_no INT NOT NULL,
  seedling_name VARCHAR(128) NOT NULL,
  specification VARCHAR(128) DEFAULT NULL,
  unit VARCHAR(32) NOT NULL DEFAULT '株',
  quantity DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  unit_price DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  remark VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_seedling_item_evaluation_id (evaluation_id)
);

CREATE TABLE appendage_evaluation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  party_id BIGINT NOT NULL,
  evaluation_no VARCHAR(64) NOT NULL,
  tenant_name VARCHAR(255) DEFAULT NULL,
  location_text VARCHAR(255) DEFAULT NULL,
  benchmark_date DATE DEFAULT NULL,
  survey_date DATE DEFAULT NULL,
  structure_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  equipment_move_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  seedling_move_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  remark VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_appendage_evaluation_no (evaluation_no),
  KEY idx_appendage_evaluation_project_id (project_id),
  KEY idx_appendage_evaluation_party_id (party_id)
);

CREATE TABLE appendage_evaluation_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  evaluation_id BIGINT NOT NULL,
  asset_type VARCHAR(32) NOT NULL,
  asset_code VARCHAR(64) DEFAULT NULL,
  line_no INT NOT NULL,
  item_name VARCHAR(128) NOT NULL,
  specification VARCHAR(255) DEFAULT NULL,
  unit VARCHAR(32) DEFAULT NULL,
  quantity DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  replacement_unit_price DECIMAL(18,2) DEFAULT NULL,
  replacement_amount DECIMAL(18,2) DEFAULT NULL,
  novelty_rate DECIMAL(18,4) DEFAULT NULL,
  evaluation_unit_price DECIMAL(18,2) DEFAULT NULL,
  evaluation_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  remark VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_appendage_item_evaluation_id (evaluation_id),
  KEY idx_appendage_item_asset_type (asset_type)
);

CREATE TABLE house_evaluation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  project_id BIGINT NOT NULL,
  party_id BIGINT NOT NULL,
  evaluation_no VARCHAR(64) NOT NULL,
  location_text VARCHAR(255) DEFAULT NULL,
  usage_type VARCHAR(64) DEFAULT NULL,
  building_area DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  unit_price DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  region_factor DECIMAL(18,4) NOT NULL DEFAULT 1.0000,
  floor_factor DECIMAL(18,4) NOT NULL DEFAULT 1.0000,
  orientation_factor DECIMAL(18,4) NOT NULL DEFAULT 1.0000,
  decoration_factor DECIMAL(18,4) NOT NULL DEFAULT 1.0000,
  total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  benchmark_date DATE DEFAULT NULL,
  survey_date DATE DEFAULT NULL,
  remark VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_house_evaluation_no (evaluation_no),
  KEY idx_house_evaluation_project_id (project_id),
  KEY idx_house_evaluation_party_id (party_id)
);

CREATE TABLE price_library (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  asset_category VARCHAR(32) NOT NULL,
  asset_name VARCHAR(128) NOT NULL,
  specification VARCHAR(255) DEFAULT NULL,
  unit VARCHAR(32) DEFAULT NULL,
  base_price DECIMAL(18,2) NOT NULL,
  effective_date DATE DEFAULT NULL,
  expiry_date DATE DEFAULT NULL,
  remark VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  KEY idx_price_library_asset_category (asset_category),
  KEY idx_price_library_asset_name (asset_name)
);

CREATE TABLE price_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  price_library_id BIGINT NOT NULL,
  change_type VARCHAR(32) NOT NULL,
  old_price DECIMAL(18,2) DEFAULT NULL,
  new_price DECIMAL(18,2) NOT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by BIGINT DEFAULT NULL,
  remark VARCHAR(500) DEFAULT NULL,
  KEY idx_price_history_price_library_id (price_library_id)
);

CREATE TABLE file_record (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  biz_type VARCHAR(32) NOT NULL,
  biz_id BIGINT DEFAULT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT DEFAULT NULL,
  file_type VARCHAR(64) DEFAULT NULL,
  storage_type VARCHAR(32) NOT NULL DEFAULT 'LOCAL',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  KEY idx_file_record_biz (biz_type, biz_id)
);

CREATE TABLE import_task (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_no VARCHAR(64) NOT NULL,
  template_type VARCHAR(32) NOT NULL,
  project_id BIGINT DEFAULT NULL,
  file_id BIGINT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  total_rows INT NOT NULL DEFAULT 0,
  success_rows INT NOT NULL DEFAULT 0,
  failed_rows INT NOT NULL DEFAULT 0,
  error_message VARCHAR(1000) DEFAULT NULL,
  result_snapshot JSON DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  UNIQUE KEY uk_import_task_no (task_no)
);

CREATE TABLE report_task (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_no VARCHAR(64) NOT NULL,
  report_type VARCHAR(32) NOT NULL,
  biz_id BIGINT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  output_file_id BIGINT DEFAULT NULL,
  error_message VARCHAR(1000) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT DEFAULT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT DEFAULT NULL,
  UNIQUE KEY uk_report_task_no (task_no)
);
