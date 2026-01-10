INSERT OR IGNORE INTO reason_catalog (
  reason_code, bucket, title_ja, title_en, severity, is_active, created_at_ts
) VALUES
  ('nomoney_s',  'SPEND',    '支出が多い（残高圧迫）',      'High spending / low balance',   'WARNING', 1, strftime('%s','now')),
  ('comeback_m', 'TRANSFER', '送金の戻り（要確認）',        'Transfer comeback',            'WARNING', 1, strftime('%s','now')),
  ('yakuza__s',  'RISK',     '反社会疑義',                  'Potential AML risk',           'DANGER',  1, strftime('%s','now')),
  ('name_not',   'KYC',      '名寄せ不一致',                'Name mismatch',                'WARNING', 1, strftime('%s','now'));
