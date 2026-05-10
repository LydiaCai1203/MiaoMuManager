INSERT INTO evaluation_project (
  project_code,
  project_name,
  project_type,
  entrusting_party,
  region_name,
  benchmark_date,
  survey_date,
  status,
  remark
)
SELECT
  'PRJ20260510001',
  '资产评估示例项目',
  'LAND_ACQUISITION',
  '示例委托方',
  '金华市',
  DATE '2026-05-10',
  DATE '2026-05-10',
  'DRAFT',
  '系统初始化示例数据'
WHERE NOT EXISTS (
  SELECT 1 FROM evaluation_project WHERE project_code = 'PRJ20260510001'
);

INSERT INTO evaluation_party (
  project_id,
  party_type,
  party_name,
  village_group,
  location_text,
  remark
)
SELECT
  p.id,
  'PERSON',
  '朱匡章',
  '岭下镇日辉路村',
  '岭下镇日辉路村',
  '来自 Excel 模板的示例对象'
FROM evaluation_project p
WHERE p.project_code = 'PRJ20260510001'
  AND NOT EXISTS (
    SELECT 1 FROM evaluation_party ep WHERE ep.project_id = p.id AND ep.party_name = '朱匡章'
  );

INSERT INTO price_library (
  asset_category,
  asset_name,
  specification,
  unit,
  base_price,
  effective_date,
  remark
)
SELECT
  'SEEDLING',
  '桂花',
  '胸径8cm',
  '株',
  120,
  DATE '2026-05-10',
  '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'SEEDLING' AND asset_name = '桂花' AND specification = '胸径8cm'
);

INSERT INTO sys_user (
  username,
  password_hash,
  real_name,
  phone,
  status
)
SELECT
  'admin',
  'dev-password',
  '管理员',
  '13800000000',
  'ENABLED'
WHERE NOT EXISTS (
  SELECT 1 FROM sys_user WHERE username = 'admin'
);
