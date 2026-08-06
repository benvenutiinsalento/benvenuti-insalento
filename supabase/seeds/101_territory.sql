-- SEED TERRITORIO — generato da scripts/generate-seeds.mjs. NON MODIFICARE A MANO.
-- Dati: data/municipalities.json (96 Comuni, coordinate GeoNames) + data/localities.json.

INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Alessano', 'alessano', 'Lecce', 'Puglia', '075002', 'https://www.comune.alessano.le.it/', 39.89381, 18.33221)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Alezio', 'alezio', 'Lecce', 'Puglia', '075003', 'https://www.comune.alezio.le.it/', 40.06226, 18.05712)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Alliste', 'alliste', 'Lecce', 'Puglia', '075004', 'https://www.comune.alliste.le.it/', 39.94803, 18.08971)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Andrano', 'andrano', 'Lecce', 'Puglia', '075005', 'https://www.comune.andrano.le.it/', 39.98546, 18.38232)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Aradeo', 'aradeo', 'Lecce', 'Puglia', '075006', 'https://www.comune.aradeo.le.it/', 40.12921, 18.12951)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Arnesano', 'arnesano', 'Lecce', 'Puglia', '075007', 'https://www.comune.arnesano.le.it/', 40.33679, 18.09145)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Bagnolo del Salento', 'bagnolo-del-salento', 'Lecce', 'Puglia', '075008', 'https://www.comune.bagnolodelsalento.le.it/', 40.14908, 18.35208)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Botrugno', 'botrugno', 'Lecce', 'Puglia', '075009', 'https://www.comune.botrugno.le.it/', 40.06359, 18.32254)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Calimera', 'calimera', 'Lecce', 'Puglia', '075010', 'https://www.comune.calimera.le.it/', 40.24948, 18.27982)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Campi Salentina', 'campi-salentina', 'Lecce', 'Puglia', '075011', 'https://www.comune.campisalentina.le.it/', 40.39747, 18.02141)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Cannole', 'cannole', 'Lecce', 'Puglia', '075012', 'https://www.comune.cannole.le.it/', 40.16592, 18.36456)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Caprarica di Lecce', 'caprarica-di-lecce', 'Lecce', 'Puglia', '075013', 'https://www.comune.capraricadilecce.le.it/', 40.2606, 18.24426)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Carmiano', 'carmiano', 'Lecce', 'Puglia', '075014', 'https://www.comune.carmiano.le.it/', 40.34404, 18.04195)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Carpignano Salentino', 'carpignano-salentino', 'Lecce', 'Puglia', '075015', 'https://www.comune.carpignanosalentino.le.it/', 40.19537, 18.33826)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Casarano', 'casarano', 'Lecce', 'Puglia', '075016', 'https://www.comune.casarano.le.it/', 40.01131, 18.16237)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Castrignano del Capo', 'castrignano-del-capo', 'Lecce', 'Puglia', '075019', 'https://www.comune.castrignanodelcapo.le.it/', 39.8328, 18.35087)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Castrignano de’ Greci', 'castrignano-de-greci', 'Lecce', 'Puglia', '075018', 'https://www.comune.castrignanodeigreci.le.it/', 40.17342, 18.29643)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Castro', 'castro', 'Lecce', 'Puglia', '075096', 'https://www.comune.castro.le.it/', 40.00702, 18.42573)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Castrì di Lecce', 'castri-di-lecce', 'Lecce', 'Puglia', '075017', 'https://www.comune.castridilecce.le.it/', 40.2736, 18.2624)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Cavallino', 'cavallino', 'Lecce', 'Puglia', '075020', 'https://www.comune.cavallino.le.it/', 40.3102, 18.20221)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Collepasso', 'collepasso', 'Lecce', 'Puglia', '075021', 'https://www.comune.collepasso.le.it/', 40.07115, 18.16222)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Copertino', 'copertino', 'Lecce', 'Puglia', '075022', 'https://www.comune.copertino.le.it/', 40.26821, 18.0543)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Corigliano d’Otranto', 'corigliano-dotranto', 'Lecce', 'Puglia', '075023', 'https://www.comune.coriglianodotranto.le.it/', 40.15925, 18.25598)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Corsano', 'corsano', 'Lecce', 'Puglia', '075024', 'https://www.comune.corsano.le.it/', 39.88911, 18.36747)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Cursi', 'cursi', 'Lecce', 'Puglia', '075025', 'https://www.comune.cursi.le.it/', 40.14847, 18.31605)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Cutrofiano', 'cutrofiano', 'Lecce', 'Puglia', '075026', 'https://www.comune.cutrofiano.le.it/', 40.12616, 18.2026)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Diso', 'diso', 'Lecce', 'Puglia', '075027', 'https://www.comune.diso.le.it/', 40.00915, 18.39144)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Gagliano del Capo', 'gagliano-del-capo', 'Lecce', 'Puglia', '075028', 'https://www.comune.gaglianodelcapo.le.it/', 39.84323, 18.36962)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Galatina', 'galatina', 'Lecce', 'Puglia', '075029', 'https://www.comune.galatina.le.it/', 40.17416, 18.17032)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Galatone', 'galatone', 'Lecce', 'Puglia', '075030', 'https://www.comune.galatone.le.it/', 40.14673, 18.06937)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Gallipoli', 'gallipoli', 'Lecce', 'Puglia', '075031', 'https://www.comune.gallipoli.le.it/', 40.05594, 17.99088)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Giuggianello', 'giuggianello', 'Lecce', 'Puglia', '075032', 'https://www.comune.giuggianello.le.it/', 40.09383, 18.36894)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Giurdignano', 'giurdignano', 'Lecce', 'Puglia', '075033', 'https://www.comune.giurdignano.le.it/', 40.12367, 18.43155)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Guagnano', 'guagnano', 'Lecce', 'Puglia', '075034', 'https://www.comune.guagnano.le.it/', 40.40123, 17.94902)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Lecce', 'lecce', 'Lecce', 'Puglia', '075035', 'https://www.comune.lecce.le.it/', 40.35481, 18.17244)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Lequile', 'lequile', 'Lecce', 'Puglia', '075036', 'https://www.comune.lequile.le.it/', 40.30583, 18.14022)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Leverano', 'leverano', 'Lecce', 'Puglia', '075037', 'https://www.comune.leverano.le.it/', 40.28852, 17.9965)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Lizzanello', 'lizzanello', 'Lecce', 'Puglia', '075038', 'https://www.comune.lizzanello.le.it/', 40.30475, 18.22283)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Maglie', 'maglie', 'Lecce', 'Puglia', '075039', 'https://www.comune.maglie.le.it/', 40.12069, 18.29797)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Martano', 'martano', 'Lecce', 'Puglia', '075040', 'https://www.comune.martano.le.it/', 40.20205, 18.30193)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Martignano', 'martignano', 'Lecce', 'Puglia', '075041', 'https://www.comune.martignano.le.it/', 40.23821, 18.25602)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Matino', 'matino', 'Lecce', 'Puglia', '075042', 'https://www.comune.matino.le.it/', 40.03083, 18.1363)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Melendugno', 'melendugno', 'Lecce', 'Puglia', '075043', 'https://www.comune.melendugno.le.it/', 40.27252, 18.33798)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Melissano', 'melissano', 'Lecce', 'Puglia', '075044', 'https://www.comune.melissano.le.it/', 39.97315, 18.12113)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Melpignano', 'melpignano', 'Lecce', 'Puglia', '075045', 'https://www.comune.melpignano.le.it/', 40.15624, 18.29194)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Miggiano', 'miggiano', 'Lecce', 'Puglia', '075046', 'https://www.comune.miggiano.le.it/', 39.9618, 18.31119)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Minervino di Lecce', 'minervino-di-lecce', 'Lecce', 'Puglia', '075047', 'https://www.comune.minervinodilecce.le.it/', 40.09025, 18.42139)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Monteroni di Lecce', 'monteroni-di-lecce', 'Lecce', 'Puglia', '075048', 'https://www.comune.monteronidilecce.le.it/', 40.31929, 18.09163)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Montesano Salentino', 'montesano-salentino', 'Lecce', 'Puglia', '075049', 'https://www.comune.montesanosalentino.le.it/', 39.97544, 18.32277)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Morciano di Leuca', 'morciano-di-leuca', 'Lecce', 'Puglia', '075050', 'https://www.comune.morcianodileuca.le.it/', 39.84719, 18.31089)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Muro Leccese', 'muro-leccese', 'Lecce', 'Puglia', '075051', 'https://www.comune.muroleccese.le.it/', 40.10286, 18.33674)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Nardò', 'nardo', 'Lecce', 'Puglia', '075052', 'https://www.comune.nardo.le.it/', 40.17953, 18.03174)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Neviano', 'neviano', 'Lecce', 'Puglia', '075053', 'https://www.comune.neviano.le.it/', 40.1065, 18.11517)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Nociglia', 'nociglia', 'Lecce', 'Puglia', '075054', 'https://www.comune.nociglia.le.it/', 40.03804, 18.32757)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Novoli', 'novoli', 'Lecce', 'Puglia', '075055', 'https://www.comune.novoli.le.it/', 40.37673, 18.04757)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Ortelle', 'ortelle', 'Lecce', 'Puglia', '075056', 'https://www.comune.ortelle.le.it/', 40.03371, 18.39125)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Otranto', 'otranto', 'Lecce', 'Puglia', '075057', 'https://www.comune.otranto.le.it/', 40.14789, 18.48682)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Palmariggi', 'palmariggi', 'Lecce', 'Puglia', '075058', 'https://www.comune.palmariggi.le.it/', 40.13099, 18.37863)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Parabita', 'parabita', 'Lecce', 'Puglia', '075059', 'https://www.comune.parabita.le.it/', 40.05139, 18.12651)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Patù', 'patu', 'Lecce', 'Puglia', '075060', 'https://www.comune.patu.le.it/', 39.84078, 18.33784)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Poggiardo', 'poggiardo', 'Lecce', 'Puglia', '075061', 'https://www.comune.poggiardo.le.it/', 40.05315, 18.37819)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Porto Cesareo', 'porto-cesareo', 'Lecce', 'Puglia', '075097', 'https://www.comune.portocesareo.le.it/', 40.26228, 17.89896)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Presicce-Acquarica', 'presicce-acquarica', 'Lecce', 'Puglia', '075098', 'https://www.comune.presicceacquarica.le.it/', 39.90055, 18.26282)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Racale', 'racale', 'Lecce', 'Puglia', '075063', 'https://www.comune.racale.le.it/', 39.96086, 18.09154)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Ruffano', 'ruffano', 'Lecce', 'Puglia', '075064', 'https://www.comune.ruffano.le.it/', 39.98195, 18.24974)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Salice Salentino', 'salice-salentino', 'Lecce', 'Puglia', '075065', 'https://www.comune.salicesalentino.le.it/', 40.38485, 17.96134)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Salve', 'salve', 'Lecce', 'Puglia', '075066', 'https://www.comune.salve.le.it/', 39.86111, 18.29493)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('San Cassiano', 'san-cassiano', 'Lecce', 'Puglia', '075095', 'https://www.comune.sancassiano.le.it/', 40.05631, 18.33392)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('San Cesario di Lecce', 'san-cesario-di-lecce', 'Lecce', 'Puglia', '075068', 'https://www.comune.sancesariodilecce.le.it/', 40.30221, 18.16098)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('San Donato di Lecce', 'san-donato-di-lecce', 'Lecce', 'Puglia', '075069', 'https://www.comune.sandonatodilecce.le.it/', 40.26728, 18.18256)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('San Pietro in Lama', 'san-pietro-in-lama', 'Lecce', 'Puglia', '075071', 'https://www.comune.sanpietroinlama.le.it/', 40.30711, 18.12787)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Sanarica', 'sanarica', 'Lecce', 'Puglia', '075067', 'https://www.comune.sanarica.le.it/', 40.08908, 18.34803)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Sannicola', 'sannicola', 'Lecce', 'Puglia', '075070', 'https://www.comune.sannicola.le.it/', 40.09244, 18.06765)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Santa Cesarea Terme', 'santa-cesarea-terme', 'Lecce', 'Puglia', '075072', 'https://www.comune.santacesareaterme.le.it/', 40.03607, 18.45542)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Scorrano', 'scorrano', 'Lecce', 'Puglia', '075073', 'https://www.comune.scorrano.le.it/', 40.09018, 18.29993)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Seclì', 'secli', 'Lecce', 'Puglia', '075074', 'https://www.comune.secli.le.it/', 40.11897, 18.10931)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Sogliano Cavour', 'sogliano-cavour', 'Lecce', 'Puglia', '075075', 'https://www.comune.soglianocavour.le.it/', 40.14827, 18.19741)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Soleto', 'soleto', 'Lecce', 'Puglia', '075076', 'https://www.comune.soleto.le.it/', 40.18781, 18.2063)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Specchia', 'specchia', 'Lecce', 'Puglia', '075077', 'https://www.comune.specchia.le.it/', 39.93913, 18.29784)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Spongano', 'spongano', 'Lecce', 'Puglia', '075078', 'https://www.comune.spongano.le.it/', 40.01782, 18.36563)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Squinzano', 'squinzano', 'Lecce', 'Puglia', '075079', 'https://www.comune.squinzano.le.it/', 40.43513, 18.04086)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Sternatia', 'sternatia', 'Lecce', 'Puglia', '075080', 'https://www.comune.sternatia.le.it/', 40.22022, 18.22748)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Supersano', 'supersano', 'Lecce', 'Puglia', '075081', 'https://www.comune.supersano.le.it/', 40.01655, 18.24205)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Surano', 'surano', 'Lecce', 'Puglia', '075082', 'https://www.comune.surano.le.it/', 40.02818, 18.34591)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Surbo', 'surbo', 'Lecce', 'Puglia', '075083', 'https://www.comune.surbo.le.it/', 40.39383, 18.13456)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Taurisano', 'taurisano', 'Lecce', 'Puglia', '075084', 'https://www.comune.taurisano.le.it/', 39.95746, 18.21498)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Taviano', 'taviano', 'Lecce', 'Puglia', '075085', 'https://www.comune.taviano.le.it/', 39.98224, 18.08151)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Tiggiano', 'tiggiano', 'Lecce', 'Puglia', '075086', 'https://www.comune.tiggiano.le.it/', 39.90284, 18.36501)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Trepuzzi', 'trepuzzi', 'Lecce', 'Puglia', '075087', 'https://www.comune.trepuzzi.le.it/', 40.40535, 18.07625)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Tricase', 'tricase', 'Lecce', 'Puglia', '075088', 'https://www.comune.tricase.le.it/', 39.93018, 18.35421)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Tuglie', 'tuglie', 'Lecce', 'Puglia', '075089', 'https://www.comune.tuglie.le.it/', 40.07346, 18.09872)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Ugento', 'ugento', 'Lecce', 'Puglia', '075090', 'https://www.comune.ugento.le.it/', 39.92724, 18.15832)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Uggiano la Chiesa', 'uggiano-la-chiesa', 'Lecce', 'Puglia', '075091', 'https://www.comune.uggianolachiesa.le.it/', 40.10091, 18.44872)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Veglie', 'veglie', 'Lecce', 'Puglia', '075092', 'https://www.comune.veglie.le.it/', 40.33474, 17.96238)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Vernole', 'vernole', 'Lecce', 'Puglia', '075093', 'https://www.comune.vernole.le.it/', 40.28834, 18.30165)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;
INSERT INTO municipalities (name, slug, province, region, istat_code, website_candidate, latitude, longitude)
VALUES ('Zollino', 'zollino', 'Lecce', 'Puglia', '075094', 'https://www.comune.zollino.le.it/', 40.20581, 18.24774)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, istat_code = EXCLUDED.istat_code,
  website_candidate = EXCLUDED.website_candidate, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude;

INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Alessano'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Alessano') AND normalized_name = 'montesardo'),
        'Montesardo', 'montesardo', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Alessano'), 'Montesardo', 'montesardo', 'montesardo', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Alliste'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Alliste') AND normalized_name = 'felline'),
        'Felline', 'felline', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Alliste'), 'Felline', 'felline', 'felline', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Alliste'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Alliste') AND normalized_name = 'capilungo'),
        'Capilungo', 'capilungo', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Alliste'), 'Capilungo', 'capilungo', 'capilungo', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Alliste'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Alliste') AND normalized_name = 'posto rosso'),
        'Posto Rosso', 'posto rosso', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Alliste'), 'Posto Rosso', 'posto-rosso', 'posto rosso', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Andrano'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Andrano') AND normalized_name = 'castiglione d otranto'),
        'Castiglione d’Otranto', 'castiglione d otranto', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Andrano'), 'Castiglione d’Otranto', 'castiglione-dotranto', 'castiglione d otranto', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Andrano'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Andrano') AND normalized_name = 'marina di andrano'),
        'Marina di Andrano', 'marina di andrano', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Andrano'), 'Marina di Andrano', 'marina-di-andrano', 'marina di andrano', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Carmiano'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Carmiano') AND normalized_name = 'magliano'),
        'Magliano', 'magliano', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Carmiano'), 'Magliano', 'magliano', 'magliano', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Castrignano del Capo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Castrignano del Capo') AND normalized_name = 'santa maria di leuca'),
        'Santa Maria di Leuca', 'santa maria di leuca', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Castrignano del Capo'), 'Santa Maria di Leuca', 'santa-maria-di-leuca', 'santa maria di leuca', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Castrignano del Capo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Castrignano del Capo') AND normalized_name = 'santa maria di leuca'),
        'Leuca', 'leuca', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Castrignano del Capo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Castrignano del Capo') AND normalized_name = 'santa maria di leuca'),
        'S.M. di Leuca', 's m di leuca', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Castrignano del Capo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Castrignano del Capo') AND normalized_name = 'santa maria di leuca'),
        'Finibus Terrae', 'finibus terrae', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Castro'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Castro') AND normalized_name = 'castro marina'),
        'Castro Marina', 'castro marina', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Castro'), 'Castro Marina', 'castro-marina', 'castro marina', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Diso'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Diso') AND normalized_name = 'marittima'),
        'Marittima', 'marittima', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Diso'), 'Marittima', 'marittima', 'marittima', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Diso'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Diso') AND normalized_name = 'acquaviva di marittima'),
        'Acquaviva di Marittima', 'acquaviva di marittima', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Diso'), 'Acquaviva di Marittima', 'acquaviva-di-marittima', 'acquaviva di marittima', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Diso'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Diso') AND normalized_name = 'acquaviva di marittima'),
        'Acquaviva', 'acquaviva', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Gagliano del Capo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Gagliano del Capo') AND normalized_name = 'arigliano'),
        'Arigliano', 'arigliano', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Gagliano del Capo'), 'Arigliano', 'arigliano', 'arigliano', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Gagliano del Capo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Gagliano del Capo') AND normalized_name = 'san dana'),
        'San Dana', 'san dana', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Gagliano del Capo'), 'San Dana', 'san-dana', 'san dana', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Galatina'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Galatina') AND normalized_name = 'collemeto'),
        'Collemeto', 'collemeto', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Galatina'), 'Collemeto', 'collemeto', 'collemeto', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Galatina'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Galatina') AND normalized_name = 'noha'),
        'Noha', 'noha', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Galatina'), 'Noha', 'noha', 'noha', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Galatina'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Galatina') AND normalized_name = 'santa barbara'),
        'Santa Barbara', 'santa barbara', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Galatina'), 'Santa Barbara', 'santa-barbara', 'santa barbara', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Gallipoli'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Gallipoli') AND normalized_name = 'baia verde'),
        'Baia Verde', 'baia verde', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Gallipoli'), 'Baia Verde', 'baia-verde', 'baia verde', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Gallipoli'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Gallipoli') AND normalized_name = 'rivabella'),
        'Rivabella', 'rivabella', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Gallipoli'), 'Rivabella', 'rivabella', 'rivabella', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Gallipoli'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Gallipoli') AND normalized_name = 'lido conchiglie'),
        'Lido Conchiglie', 'lido conchiglie', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Gallipoli'), 'Lido Conchiglie', 'lido-conchiglie', 'lido conchiglie', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Guagnano'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Guagnano') AND normalized_name = 'villa baldassarri'),
        'Villa Baldassarri', 'villa baldassarri', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Guagnano'), 'Villa Baldassarri', 'villa-baldassarri', 'villa baldassarri', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Lecce') AND normalized_name = 'frigole'),
        'Frigole', 'frigole', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'), 'Frigole', 'frigole', 'frigole', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Lecce') AND normalized_name = 'san cataldo'),
        'San Cataldo', 'san cataldo', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'), 'San Cataldo', 'san-cataldo', 'san cataldo', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Lecce') AND normalized_name = 'torre chianca'),
        'Torre Chianca', 'torre chianca', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'), 'Torre Chianca', 'torre-chianca', 'torre chianca', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Lecce') AND normalized_name = 'spiaggiabella'),
        'Spiaggiabella', 'spiaggiabella', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'), 'Spiaggiabella', 'spiaggiabella', 'spiaggiabella', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Lecce') AND normalized_name = 'torre rinalda'),
        'Torre Rinalda', 'torre rinalda', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'), 'Torre Rinalda', 'torre-rinalda', 'torre rinalda', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Lecce') AND normalized_name = 'san ligorio'),
        'San Ligorio', 'san ligorio', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lecce'), 'San Ligorio', 'san-ligorio', 'san ligorio', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lizzanello'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Lizzanello') AND normalized_name = 'merine'),
        'Merine', 'merine', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Lizzanello'), 'Merine', 'merine', 'merine', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Melendugno') AND normalized_name = 'borgagne'),
        'Borgagne', 'borgagne', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'), 'Borgagne', 'borgagne', 'borgagne', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Melendugno') AND normalized_name = 'san foca'),
        'San Foca', 'san foca', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'), 'San Foca', 'san-foca', 'san foca', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Melendugno') AND normalized_name = 'roca vecchia'),
        'Roca Vecchia', 'roca vecchia', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'), 'Roca Vecchia', 'roca-vecchia', 'roca vecchia', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Melendugno') AND normalized_name = 'roca vecchia'),
        'Roca', 'roca', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Melendugno') AND normalized_name = 'roca nuova'),
        'Roca Nuova', 'roca nuova', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'), 'Roca Nuova', 'roca-nuova', 'roca nuova', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Melendugno') AND normalized_name = 'torre dell orso'),
        'Torre dell’Orso', 'torre dell orso', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'), 'Torre dell’Orso', 'torre-dellorso', 'torre dell orso', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Melendugno') AND normalized_name = 'sant andrea'),
        'Sant’Andrea', 'sant andrea', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Melendugno'), 'Sant’Andrea', 'santandrea', 'sant andrea', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Minervino di Lecce'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Minervino di Lecce') AND normalized_name = 'cocumola'),
        'Cocumola', 'cocumola', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Minervino di Lecce'), 'Cocumola', 'cocumola', 'cocumola', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Minervino di Lecce'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Minervino di Lecce') AND normalized_name = 'specchia gallone'),
        'Specchia Gallone', 'specchia gallone', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Minervino di Lecce'), 'Specchia Gallone', 'specchia-gallone', 'specchia gallone', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Morciano di Leuca'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Morciano di Leuca') AND normalized_name = 'barbarano del capo'),
        'Barbarano del Capo', 'barbarano del capo', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Morciano di Leuca'), 'Barbarano del Capo', 'barbarano-del-capo', 'barbarano del capo', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Morciano di Leuca'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Morciano di Leuca') AND normalized_name = 'barbarano del capo'),
        'Barbarano', 'barbarano', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Morciano di Leuca'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Morciano di Leuca') AND normalized_name = 'torre vado'),
        'Torre Vado', 'torre vado', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Morciano di Leuca'), 'Torre Vado', 'torre-vado', 'torre vado', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Nardò') AND normalized_name = 'santa caterina'),
        'Santa Caterina', 'santa caterina', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'), 'Santa Caterina', 'santa-caterina', 'santa caterina', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Nardò') AND normalized_name = 'santa caterina'),
        'Santa Caterina di Nardò', 'santa caterina di nardo', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Nardò') AND normalized_name = 'santa maria al bagno'),
        'Santa Maria al Bagno', 'santa maria al bagno', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'), 'Santa Maria al Bagno', 'santa-maria-al-bagno', 'santa maria al bagno', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Nardò') AND normalized_name = 'sant isidoro'),
        'Sant’Isidoro', 'sant isidoro', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'), 'Sant’Isidoro', 'santisidoro', 'sant isidoro', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Nardò') AND normalized_name = 'sant isidoro'),
        'San Isidoro', 'san isidoro', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Nardò') AND normalized_name = 'porto selvaggio'),
        'Porto Selvaggio', 'porto selvaggio', 'localita')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'), 'Porto Selvaggio', 'porto-selvaggio', 'porto selvaggio', 'localita')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Nardò') AND normalized_name = 'porto selvaggio'),
        'Parco di Porto Selvaggio', 'parco di porto selvaggio', 'localita')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Nardò') AND normalized_name = 'villaggio resta'),
        'Villaggio Resta', 'villaggio resta', 'localita')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Nardò'), 'Villaggio Resta', 'villaggio-resta', 'villaggio resta', 'localita')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ortelle'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Ortelle') AND normalized_name = 'vignacastrisi'),
        'Vignacastrisi', 'vignacastrisi', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ortelle'), 'Vignacastrisi', 'vignacastrisi', 'vignacastrisi', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Otranto'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Otranto') AND normalized_name = 'porto badisco'),
        'Porto Badisco', 'porto badisco', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Otranto'), 'Porto Badisco', 'porto-badisco', 'porto badisco', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Palmariggi'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Palmariggi') AND normalized_name = 'montevergine'),
        'Montevergine', 'montevergine', 'localita')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Palmariggi'), 'Montevergine', 'montevergine', 'montevergine', 'localita')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Poggiardo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Poggiardo') AND normalized_name = 'vaste'),
        'Vaste', 'vaste', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Poggiardo'), 'Vaste', 'vaste', 'vaste', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Porto Cesareo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Porto Cesareo') AND normalized_name = 'torre lapillo'),
        'Torre Lapillo', 'torre lapillo', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Porto Cesareo'), 'Torre Lapillo', 'torre-lapillo', 'torre lapillo', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Porto Cesareo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Porto Cesareo') AND normalized_name = 'punta prosciutto'),
        'Punta Prosciutto', 'punta prosciutto', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Porto Cesareo'), 'Punta Prosciutto', 'punta-prosciutto', 'punta prosciutto', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Porto Cesareo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Porto Cesareo') AND normalized_name = 'punta prosciutto'),
        'Punta Prosciutto di Porto Cesareo', 'punta prosciutto di porto cesareo', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica') AND normalized_name = 'presicce'),
        'Presicce', 'presicce', 'borgo')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica'), 'Presicce', 'presicce', 'presicce', 'borgo')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica') AND normalized_name = 'acquarica del capo'),
        'Acquarica del Capo', 'acquarica del capo', 'borgo')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica'), 'Acquarica del Capo', 'acquarica-del-capo', 'acquarica del capo', 'borgo')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica') AND normalized_name = 'acquarica del capo'),
        'Acquarica', 'acquarica', 'borgo')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica') AND normalized_name = 'lido marini'),
        'Lido Marini', 'lido marini', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Presicce-Acquarica'), 'Lido Marini', 'lido-marini', 'lido marini', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Racale'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Racale') AND normalized_name = 'torre suda'),
        'Torre Suda', 'torre suda', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Racale'), 'Torre Suda', 'torre-suda', 'torre suda', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ruffano'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Ruffano') AND normalized_name = 'torrepaduli'),
        'Torrepaduli', 'torrepaduli', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ruffano'), 'Torrepaduli', 'torrepaduli', 'torrepaduli', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Salve'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Salve') AND normalized_name = 'ruggiano'),
        'Ruggiano', 'ruggiano', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Salve'), 'Ruggiano', 'ruggiano', 'ruggiano', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Salve'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Salve') AND normalized_name = 'pescoluse'),
        'Pescoluse', 'pescoluse', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Salve'), 'Pescoluse', 'pescoluse', 'pescoluse', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Salve'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Salve') AND normalized_name = 'torre pali'),
        'Torre Pali', 'torre pali', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Salve'), 'Torre Pali', 'torre-pali', 'torre pali', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Salve'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Salve') AND normalized_name = 'posto vecchio'),
        'Posto Vecchio', 'posto vecchio', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Salve'), 'Posto Vecchio', 'posto-vecchio', 'posto vecchio', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'San Donato di Lecce'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'San Donato di Lecce') AND normalized_name = 'galugnano'),
        'Galugnano', 'galugnano', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'San Donato di Lecce'), 'Galugnano', 'galugnano', 'galugnano', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Sannicola'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Sannicola') AND normalized_name = 'chiesanuova'),
        'Chiesanuova', 'chiesanuova', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Sannicola'), 'Chiesanuova', 'chiesanuova', 'chiesanuova', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Sannicola'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Sannicola') AND normalized_name = 'san simone'),
        'San Simone', 'san simone', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Sannicola'), 'San Simone', 'san-simone', 'san simone', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Sannicola'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Sannicola') AND normalized_name = 'lido conchiglie'),
        'Lido Conchiglie', 'lido conchiglie', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Sannicola'), 'Lido Conchiglie', 'lido-conchiglie', 'lido conchiglie', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Santa Cesarea Terme'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Santa Cesarea Terme') AND normalized_name = 'cerfignano'),
        'Cerfignano', 'cerfignano', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Santa Cesarea Terme'), 'Cerfignano', 'cerfignano', 'cerfignano', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Santa Cesarea Terme'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Santa Cesarea Terme') AND normalized_name = 'vitigliano'),
        'Vitigliano', 'vitigliano', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Santa Cesarea Terme'), 'Vitigliano', 'vitigliano', 'vitigliano', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Santa Cesarea Terme'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Santa Cesarea Terme') AND normalized_name = 'porto miggiano'),
        'Porto Miggiano', 'porto miggiano', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Santa Cesarea Terme'), 'Porto Miggiano', 'porto-miggiano', 'porto miggiano', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Surbo'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Surbo') AND normalized_name = 'giorgilorio'),
        'Giorgilorio', 'giorgilorio', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Surbo'), 'Giorgilorio', 'giorgilorio', 'giorgilorio', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Taviano'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Taviano') AND normalized_name = 'marina di mancaversa'),
        'Marina di Mancaversa', 'marina di mancaversa', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Taviano'), 'Marina di Mancaversa', 'marina-di-mancaversa', 'marina di mancaversa', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Taviano'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Taviano') AND normalized_name = 'marina di mancaversa'),
        'Mancaversa', 'mancaversa', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Trepuzzi'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Trepuzzi') AND normalized_name = 'casalabate'),
        'Casalabate', 'casalabate', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Trepuzzi'), 'Casalabate', 'casalabate', 'casalabate', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Tricase') AND normalized_name = 'depressa'),
        'Depressa', 'depressa', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'), 'Depressa', 'depressa', 'depressa', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Tricase') AND normalized_name = 'lucugnano'),
        'Lucugnano', 'lucugnano', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'), 'Lucugnano', 'lucugnano', 'lucugnano', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Tricase') AND normalized_name = 'tutino'),
        'Tutino', 'tutino', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'), 'Tutino', 'tutino', 'tutino', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Tricase') AND normalized_name = 'caprarica del capo'),
        'Caprarica del Capo', 'caprarica del capo', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'), 'Caprarica del Capo', 'caprarica-del-capo', 'caprarica del capo', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Tricase') AND normalized_name = 'sant eufemia'),
        'Sant’Eufemia', 'sant eufemia', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'), 'Sant’Eufemia', 'santeufemia', 'sant eufemia', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Tricase') AND normalized_name = 'marina serra'),
        'Marina Serra', 'marina serra', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'), 'Marina Serra', 'marina-serra', 'marina serra', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Tricase') AND normalized_name = 'tricase porto'),
        'Tricase Porto', 'tricase porto', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tricase'), 'Tricase Porto', 'tricase-porto', 'tricase porto', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tuglie'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Tuglie') AND normalized_name = 'montegrappa'),
        'Montegrappa', 'montegrappa', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Tuglie'), 'Montegrappa', 'montegrappa', 'montegrappa', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ugento'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Ugento') AND normalized_name = 'gemini'),
        'Gemini', 'gemini', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ugento'), 'Gemini', 'gemini', 'gemini', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ugento'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Ugento') AND normalized_name = 'torre san giovanni'),
        'Torre San Giovanni', 'torre san giovanni', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ugento'), 'Torre San Giovanni', 'torre-san-giovanni', 'torre san giovanni', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ugento'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Ugento') AND normalized_name = 'torre mozza'),
        'Torre Mozza', 'torre mozza', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ugento'), 'Torre Mozza', 'torre-mozza', 'torre mozza', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ugento'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Ugento') AND normalized_name = 'lido marini'),
        'Lido Marini', 'lido marini', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Ugento'), 'Lido Marini', 'lido-marini', 'lido marini', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Uggiano la Chiesa'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Uggiano la Chiesa') AND normalized_name = 'casamassella'),
        'Casamassella', 'casamassella', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Uggiano la Chiesa'), 'Casamassella', 'casamassella', 'casamassella', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Vernole') AND normalized_name = 'acaya'),
        'Acaya', 'acaya', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'), 'Acaya', 'acaya', 'acaya', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Vernole') AND normalized_name = 'acaya'),
        'Acaia', 'acaia', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Vernole') AND normalized_name = 'acquarica di lecce'),
        'Acquarica di Lecce', 'acquarica di lecce', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'), 'Acquarica di Lecce', 'acquarica-di-lecce', 'acquarica di lecce', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Vernole') AND normalized_name = 'struda'),
        'Strudà', 'struda', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'), 'Strudà', 'struda', 'struda', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Vernole') AND normalized_name = 'struda'),
        'Struda', 'struda', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, locality_type = EXCLUDED.locality_type;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Vernole') AND normalized_name = 'vanze'),
        'Vanze', 'vanze', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'), 'Vanze', 'vanze', 'vanze', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Vernole') AND normalized_name = 'pisignano'),
        'Pisignano', 'pisignano', 'frazione')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'), 'Pisignano', 'pisignano', 'pisignano', 'frazione')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;
INSERT INTO territorial_aliases (municipality_id, locality_id, alias, normalized_alias, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'),
        (SELECT id FROM localities WHERE municipality_id = (SELECT id FROM municipalities WHERE name = 'Vernole') AND normalized_name = 'san foca'),
        'San Foca', 'san foca', 'marina')
ON CONFLICT (normalized_alias) DO UPDATE SET alias = EXCLUDED.alias, municipality_id = EXCLUDED.municipality_id, locality_type = EXCLUDED.locality_type;
INSERT INTO localities (municipality_id, name, slug, normalized_name, locality_type)
VALUES ((SELECT id FROM municipalities WHERE name = 'Vernole'), 'San Foca', 'san-foca', 'san foca', 'marina')
ON CONFLICT (municipality_id, normalized_name) DO UPDATE SET name = EXCLUDED.name, locality_type = EXCLUDED.locality_type, slug = EXCLUDED.slug;

