-- SEED FONTI CORE — generato da scripts/generate-seeds.mjs da data/source-registry.json.
-- Registro curato: approved=TRUE perché fonti verificate editorialmente; auto_publish
-- abilitato solo per priorità 1-2 (mandato: pubblicazione automatica condizionata).

INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('regione-puglia-eventi-json', 'Regione Puglia — Cosa fare in Puglia', 'regional_open_data', 'https://osservatorio.dms.puglia.it/opendata/puglia_eventi_attivita/eventi_attivita.json', 'https://osservatorio.dms.puglia.it',
  'json', 2, 'institutional', 'puglia_json',
  6, 80, 'approved', TRUE, TRUE,
  TRUE, FALSE, 'open_data')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('ipa-enti', 'Indice delle Pubbliche Amministrazioni — Enti', 'official_registry', 'https://indicepa.gov.it/ipa-dati/api/3/action/datastore_search?resource_id=d09adf99-dc10-4349-8c53-27b1e5aa97b6&limit=50000', 'https://indicepa.gov.it',
  'html', 1, 'institutional', 'ipa_entities',
  6, 80, 'approved', TRUE, TRUE,
  TRUE, TRUE, 'open_data')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('regione-puglia-albo-pro-loco', 'Regione Puglia — Albo regionale Pro Loco', 'official_registry', 'https://www.regione.puglia.it/web/turismo/albo-pro-loco', 'https://www.regione.puglia.it',
  'html', 2, 'institutional', 'pro_loco_registry',
  6, 80, 'approved', TRUE, TRUE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('unpli-puglia', 'UNPLI Puglia', 'pro_loco_network', 'https://www.prolocopuglia.it/', 'https://www.prolocopuglia.it',
  'html', 3, 'secondary', 'organization_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('unpli-lecce-x', 'UNPLI X Delegazione Lecce', 'pro_loco_registry', 'https://www.prolocopuglia.it/delegazioni/x-comitato-provinciale-lecce/', 'https://www.prolocopuglia.it',
  'html', 3, 'secondary', 'organization_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('unpli-grecia-xi', 'UNPLI XI Delegazione Grecia Salentina', 'pro_loco_registry', 'https://www.prolocopuglia.it/delegazioni/xi-delegazione-grecia-salentina/', 'https://www.prolocopuglia.it',
  'html', 3, 'secondary', 'organization_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('unpli-messapia-xii', 'UNPLI XII Delegazione Messapia', 'pro_loco_registry', 'https://www.prolocopuglia.it/delegazioni/xii-delegazione-messapia/', 'https://www.prolocopuglia.it',
  'html', 3, 'secondary', 'organization_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('unpli-finibus-xiii', 'UNPLI XIII Delegazione Finibus Terrae', 'pro_loco_registry', 'https://www.prolocopuglia.it/delegazioni/xiii-delegazione-finibus-terrae/', 'https://www.prolocopuglia.it',
  'html', 3, 'secondary', 'organization_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('unpli-ionica-xiv', 'UNPLI XIV Delegazione Ionica Terrae Salentine', 'pro_loco_registry', 'https://www.prolocopuglia.it/delegazioni/xiv-delegazione-ionica-terrae-salentine/', 'https://www.prolocopuglia.it',
  'html', 3, 'secondary', 'organization_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('puglia-culture-eventi', 'Puglia Culture', 'regional_cultural_portal', 'https://www.pugliaculture.it/ricerca-eventi/', 'https://www.pugliaculture.it',
  'html', 3, 'secondary', 'generic_html',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, FALSE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('provincia-lecce', 'Provincia di Lecce', 'province', 'https://www.provincia.le.it/', 'https://www.provincia.le.it',
  'html', 2, 'institutional', 'municipal_discovery',
  6, 80, 'approved', TRUE, TRUE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('arcidiocesi-lecce', 'Arcidiocesi di Lecce', 'diocese', 'https://www.diocesilecce.org/', 'https://www.diocesilecce.org',
  'html', 3, 'secondary', 'religious_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('arcidiocesi-otranto', 'Arcidiocesi di Otranto', 'diocese', 'https://www.diocesiotranto.it/', 'https://www.diocesiotranto.it',
  'html', 3, 'secondary', 'religious_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('diocesi-nardo-gallipoli', 'Diocesi di Nardò-Gallipoli', 'diocese', 'https://www.diocesinardogallipoli.it/', 'https://www.diocesinardogallipoli.it',
  'html', 3, 'secondary', 'religious_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('diocesi-ugento-leuca', 'Diocesi di Ugento-Santa Maria di Leuca', 'diocese', 'https://www.diocesiugento.org/', 'https://www.diocesiugento.org',
  'html', 3, 'secondary', 'religious_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('portalecce-eventi-religiosi', 'Portalecce — informazione dell''Arcidiocesi di Lecce', 'diocesan_news', 'https://www.portalecce.it/', 'https://www.portalecce.it',
  'html', 3, 'secondary', 'religious_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('arcidiocesi-lecce-parrocchie', 'Arcidiocesi di Lecce — Parrocchie e Vicarie', 'parish_directory', 'https://www.diocesilecce.org/diocesi-di-lecce/parrocchie/', 'https://www.diocesilecce.org',
  'html', 3, 'secondary', 'religious_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('arcidiocesi-otranto-parrocchie', 'Arcidiocesi di Otranto — Enti e Parrocchie', 'parish_directory', 'https://www.diocesiotranto.it/wd-annuario-enti/', 'https://www.diocesiotranto.it',
  'html', 3, 'secondary', 'religious_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('diocesi-nardo-gallipoli-parrocchie', 'Diocesi di Nardò-Gallipoli — Parrocchie', 'parish_directory', 'https://diocesinardogallipoli.it/parrocchie/', 'https://diocesinardogallipoli.it',
  'html', 3, 'secondary', 'religious_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
INSERT INTO sources (source_key, entity_name, source_type, url, base_url, format, priority, authority_level,
  parser_type, check_frequency_hours, reliability_score, status, approved, auto_publish, active, discovery_only, crawl_policy)
VALUES ('diocesi-ugento-leuca-parrocchie', 'Diocesi di Ugento-Santa Maria di Leuca — Parrocchie', 'parish_directory', 'https://diocesiugento.org/parrocchie-della-diocesi/', 'https://diocesiugento.org',
  'html', 3, 'secondary', 'religious_discovery',
  12, 60, 'approved', TRUE, FALSE,
  TRUE, TRUE, 'public_page')
ON CONFLICT (source_key) DO UPDATE SET entity_name = EXCLUDED.entity_name, url = EXCLUDED.url,
  base_url = EXCLUDED.base_url, format = EXCLUDED.format, priority = EXCLUDED.priority,
  authority_level = EXCLUDED.authority_level, parser_type = EXCLUDED.parser_type,
  status = EXCLUDED.status, approved = EXCLUDED.approved, auto_publish = EXCLUDED.auto_publish,
  active = EXCLUDED.active, discovery_only = EXCLUDED.discovery_only, crawl_policy = EXCLUDED.crawl_policy;
