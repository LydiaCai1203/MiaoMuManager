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

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'SEEDLING', '桂花', '胸径10cm', '株', 280, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'SEEDLING' AND asset_name = '桂花' AND specification = '胸径10cm'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'SEEDLING', '桂花', '胸径15cm', '株', 650, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'SEEDLING' AND asset_name = '桂花' AND specification = '胸径15cm'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'SEEDLING', '香樟', '胸径10cm', '株', 200, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'SEEDLING' AND asset_name = '香樟' AND specification = '胸径10cm'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'SEEDLING', '香樟', '胸径15cm', '株', 500, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'SEEDLING' AND asset_name = '香樟' AND specification = '胸径15cm'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'SEEDLING', '香樟', '胸径20cm', '株', 1200, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'SEEDLING' AND asset_name = '香樟' AND specification = '胸径20cm'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'APPENDAGE_STRUCTURE', '门墩', '0.4*0.4高3米*2个', '项', 680, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'APPENDAGE_STRUCTURE' AND asset_name = '门墩' AND specification = '0.4*0.4高3米*2个'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'APPENDAGE_STRUCTURE', '围墙', '砖砌240mm', '米', 350, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'APPENDAGE_STRUCTURE' AND asset_name = '围墙' AND specification = '砖砌240mm'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'APPENDAGE_STRUCTURE', '围墙', '砖砌120mm', '米', 180, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'APPENDAGE_STRUCTURE' AND asset_name = '围墙' AND specification = '砖砌120mm'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'APPENDAGE_EQUIPMENT_MOVE', '空调', '壁挂式', '台', 300, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'APPENDAGE_EQUIPMENT_MOVE' AND asset_name = '空调' AND specification = '壁挂式'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'APPENDAGE_EQUIPMENT_MOVE', '空调', '柜式', '台', 500, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'APPENDAGE_EQUIPMENT_MOVE' AND asset_name = '空调' AND specification = '柜式'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'APPENDAGE_SEEDLING_MOVE', '桂花移植', '胸径10cm', '株', 80, DATE '2026-05-10', '初始化价格数据'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'APPENDAGE_SEEDLING_MOVE' AND asset_name = '桂花移植' AND specification = '胸径10cm'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'HOUSE', 'RESIDENTIAL', '住宅基准价', '元/m²', 9800, DATE '2026-05-10', '住宅类房屋基准价'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'HOUSE' AND asset_name = 'RESIDENTIAL'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'HOUSE', 'COMMERCIAL', '商业基准价', '元/m²', 15000, DATE '2026-05-10', '商业类房屋基准价'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'HOUSE' AND asset_name = 'COMMERCIAL'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'HOUSE', 'OFFICE', '办公基准价', '元/m²', 12000, DATE '2026-05-10', '办公类房屋基准价'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'HOUSE' AND asset_name = 'OFFICE'
);

INSERT INTO price_library (asset_category, asset_name, specification, unit, base_price, effective_date, remark)
SELECT 'HOUSE', 'WAREHOUSE', '仓储基准价', '元/m²', 5000, DATE '2026-05-10', '仓储类房屋基准价'
WHERE NOT EXISTS (
  SELECT 1 FROM price_library WHERE asset_category = 'HOUSE' AND asset_name = 'WAREHOUSE'
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

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'PROJECT_TYPE', 'LAND_ACQUISITION', '土地征收', 10, 1, '项目类型默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'PROJECT_TYPE' AND option_value = 'LAND_ACQUISITION'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'PROJECT_TYPE', 'HOUSE_DEMOLITION', '房屋拆迁', 20, 1, '项目类型默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'PROJECT_TYPE' AND option_value = 'HOUSE_DEMOLITION'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'PROJECT_TYPE', 'SEEDLING_EVALUATION', '苗木评估', 30, 1, '项目类型默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'PROJECT_TYPE' AND option_value = 'SEEDLING_EVALUATION'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'PROJECT_TYPE', 'APPENDAGE_EVALUATION', '附属物评估', 40, 1, '项目类型默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'PROJECT_TYPE' AND option_value = 'APPENDAGE_EVALUATION'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'PROJECT_TYPE', 'MIXED_ASSET', '综合资产', 50, 1, '项目类型默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'PROJECT_TYPE' AND option_value = 'MIXED_ASSET'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'ASSET_CATEGORY', 'SEEDLING', '苗木', 10, 1, '价格分类默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'ASSET_CATEGORY' AND option_value = 'SEEDLING'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'ASSET_CATEGORY', 'APPENDAGE_STRUCTURE', '构筑物', 20, 1, '价格分类默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'ASSET_CATEGORY' AND option_value = 'APPENDAGE_STRUCTURE'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'ASSET_CATEGORY', 'APPENDAGE_EQUIPMENT_MOVE', '设备搬迁', 30, 1, '价格分类默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'ASSET_CATEGORY' AND option_value = 'APPENDAGE_EQUIPMENT_MOVE'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'ASSET_CATEGORY', 'APPENDAGE_SEEDLING_MOVE', '苗木移植', 40, 1, '价格分类默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'ASSET_CATEGORY' AND option_value = 'APPENDAGE_SEEDLING_MOVE'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'ASSET_CATEGORY', 'HOUSE', '房屋', 50, 1, '价格分类默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'ASSET_CATEGORY' AND option_value = 'HOUSE'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'PARTY_TYPE', 'PERSON', '个人', 10, 1, '对象类型默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'PARTY_TYPE' AND option_value = 'PERSON'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'PARTY_TYPE', 'ORGANIZATION', '单位', 20, 1, '对象类型默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'PARTY_TYPE' AND option_value = 'ORGANIZATION'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'PARTY_TYPE', 'TENANT', '租户', 30, 1, '对象类型默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'PARTY_TYPE' AND option_value = 'TENANT'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'PARTY_TYPE', 'VILLAGE_GROUP', '村组', 40, 1, '对象类型默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'PARTY_TYPE' AND option_value = 'VILLAGE_GROUP'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'PARTY_TYPE', 'OTHER', '其他', 50, 1, '对象类型默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'PARTY_TYPE' AND option_value = 'OTHER'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'HOUSE_USAGE_TYPE', 'RESIDENTIAL', '住宅', 10, 1, '房屋用途默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'HOUSE_USAGE_TYPE' AND option_value = 'RESIDENTIAL'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'HOUSE_USAGE_TYPE', 'COMMERCIAL', '商业', 20, 1, '房屋用途默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'HOUSE_USAGE_TYPE' AND option_value = 'COMMERCIAL'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'HOUSE_USAGE_TYPE', 'OFFICE', '办公', 30, 1, '房屋用途默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'HOUSE_USAGE_TYPE' AND option_value = 'OFFICE'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'HOUSE_USAGE_TYPE', 'WAREHOUSE', '仓储', 40, 1, '房屋用途默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'HOUSE_USAGE_TYPE' AND option_value = 'WAREHOUSE'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'HOUSE_USAGE_TYPE', 'OTHER', '其他', 50, 1, '房屋用途默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'HOUSE_USAGE_TYPE' AND option_value = 'OTHER'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'USER_STATUS', 'ENABLED', '启用', 10, 1, '用户状态默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'USER_STATUS' AND option_value = 'ENABLED'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'USER_STATUS', 'DISABLED', '禁用', 20, 1, '用户状态默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'USER_STATUS' AND option_value = 'DISABLED'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'EVALUATION_STATUS', 'DRAFT', '草稿', 10, 1, '评估单状态默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'EVALUATION_STATUS' AND option_value = 'DRAFT'
);

INSERT INTO option_item (group_code, option_value, option_label, sort_order, enabled, remark)
SELECT 'EVALUATION_STATUS', 'SUBMITTED', '已提交', 20, 1, '评估单状态默认项'
WHERE NOT EXISTS (
  SELECT 1 FROM option_item WHERE group_code = 'EVALUATION_STATUS' AND option_value = 'SUBMITTED'
);
