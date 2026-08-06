-- Seed categorie ufficiali del mandato (un evento può avere più categorie).
-- Costanti di dominio richieste dal capitolato; la tabella events non tocca.
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Sagre','sagre',10),
  ('Feste patronali','feste-patronali',20),
  ('Tradizioni','tradizioni',30),
  ('Pizzica e musica popolare','pizzica-e-musica-popolare',40),
  ('Concerti','concerti',50),
  ('Musica dal vivo','musica-dal-vivo',60),
  ('Festival','festival',70),
  ('Cultura','cultura',80),
  ('Teatro','teatro',90),
  ('Cinema','cinema',100),
  ('Arte e mostre','arte-e-mostre',110),
  ('Mercatini','mercatini',120),
  ('Enogastronomia','enogastronomia',130),
  ('Famiglie e bambini','famiglie-e-bambini',140),
  ('Sport','sport',150),
  ('Natura','natura',160),
  ('Religione','religione',170),
  ('Nightlife','nightlife',180),
  ('Workshop e laboratori','workshop-e-laboratori',190),
  ('Visite guidate','visite-guidate',200),
  ('Altro','altro',210)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;
