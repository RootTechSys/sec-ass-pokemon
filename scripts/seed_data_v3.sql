USE pokemon_cards;


-- Adding 50+ more Pokemon with diverse types and generations
INSERT INTO pokemon_cards (name, type, rarity, image, hp, attack, defense, price, generation, evolution_stage) VALUES
-- Generation 3 Pokemon
('Treecko', 'Grass', 'Common', '/treecko-pokemon-card.png', 40, 45, 35, 8, 3, 'Basic'),
('Grovyle', 'Grass', 'Uncommon', '/grovyle-pokemon-card.png', 70, 65, 45, 20, 3, 'Stage1'),
('Sceptile', 'Grass', 'Rare', '/sceptile-pokemon-card.png', 100, 85, 65, 45, 3, 'Stage2'),
('Torchic', 'Fire', 'Common', '/torchic-pokemon-card.png', 45, 60, 40, 8, 3, 'Basic'),
('Combusken', 'Fire', 'Uncommon', '/combusken-pokemon-card.png', 80, 85, 60, 20, 3, 'Stage1'),
('Blaziken', 'Fire', 'Rare', '/blaziken-pokemon-card.png', 110, 120, 70, 45, 3, 'Stage2'),
('Mudkip', 'Water', 'Common', '/mudkip-pokemon-card.png', 50, 70, 50, 8, 3, 'Basic'),
('Marshtomp', 'Water', 'Uncommon', '/marshtomp-pokemon-card.png', 90, 85, 70, 20, 3, 'Stage1'),
('Swampert', 'Water', 'Rare', '/swampert-pokemon-card.png', 120, 110, 90, 45, 3, 'Stage2'),
('Rayquaza', 'Dragon', 'Legendary', '/rayquaza-pokemon-card.png', 105, 150, 90, 120, 3, 'Basic'),
('Kyogre', 'Water', 'Legendary', '/kyogre-pokemon-card.png', 100, 100, 90, 120, 3, 'Basic'),
('Groudon', 'Ground', 'Legendary', '/groudon-pokemon-card.png', 100, 150, 140, 120, 3, 'Basic'),
('Latios', 'Dragon', 'Legendary', '/latios-pokemon-card.png', 80, 90, 80, 100, 3, 'Basic'),
('Latias', 'Dragon', 'Legendary', '/latias-pokemon-card.png', 80, 80, 90, 100, 3, 'Basic'),
('Metagross', 'Steel', 'Rare', '/metagross-pokemon-card.png', 80, 135, 130, 50, 3, 'Stage2'),
('Beldum', 'Steel', 'Common', '/beldum-pokemon-card.png', 40, 55, 80, 10, 3, 'Basic'),
('Metang', 'Steel', 'Uncommon', '/metang-pokemon-card.png', 60, 75, 100, 25, 3, 'Stage1'),
('Salamence', 'Dragon', 'Rare', '/salamence-pokemon-card.png', 95, 135, 80, 55, 3, 'Stage2'),
('Bagon', 'Dragon', 'Common', '/bagon-pokemon-card.png', 45, 75, 60, 12, 3, 'Basic'),
('Shelgon', 'Dragon', 'Uncommon', '/shelgon-pokemon-card.png', 65, 95, 100, 28, 3, 'Stage1'),

-- Generation 4 Pokemon
('Turtwig', 'Grass', 'Common', '/turtwig-pokemon-card.png', 55, 68, 64, 8, 4, 'Basic'),
('Grotle', 'Grass', 'Uncommon', '/grotle-pokemon-card.png', 95, 89, 85, 20, 4, 'Stage1'),
('Torterra', 'Grass', 'Rare', '/torterra-pokemon-card.png', 135, 109, 105, 45, 4, 'Stage2'),
('Chimchar', 'Fire', 'Common', '/chimchar-pokemon-card.png', 44, 58, 44, 8, 4, 'Basic'),
('Monferno', 'Fire', 'Uncommon', '/monferno-pokemon-card.png', 78, 78, 52, 20, 4, 'Stage1'),
('Infernape', 'Fire', 'Rare', '/infernape-pokemon-card.png', 108, 104, 71, 45, 4, 'Stage2'),
('Piplup', 'Water', 'Common', '/piplup-pokemon-card.png', 53, 51, 53, 8, 4, 'Basic'),
('Prinplup', 'Water', 'Uncommon', '/prinplup-pokemon-card.png', 84, 66, 68, 20, 4, 'Stage1'),
('Empoleon', 'Water', 'Rare', '/empoleon-pokemon-card.png', 114, 86, 88, 45, 4, 'Stage2'),
('Dialga', 'Steel', 'Legendary', '/dialga-pokemon-card.png', 100, 120, 120, 130, 4, 'Basic'),
('Palkia', 'Water', 'Legendary', '/palkia-pokemon-card.png', 90, 120, 100, 130, 4, 'Basic'),
('Giratina', 'Ghost', 'Legendary', '/giratina-pokemon-card.png', 150, 100, 120, 130, 4, 'Basic'),
('Arceus', 'Normal', 'Mythic', '/arceus-pokemon-card.png', 120, 120, 120, 200, 4, 'Basic'),
('Darkrai', 'Dark', 'Mythic', '/darkrai-pokemon-card.png', 70, 90, 90, 180, 4, 'Basic'),
('Shaymin', 'Grass', 'Mythic', '/shaymin-pokemon-card.png', 100, 100, 100, 160, 4, 'Basic'),

-- Generation 5 Pokemon
('Snivy', 'Grass', 'Common', '/snivy-pokemon-card.png', 45, 45, 55, 8, 5, 'Basic'),
('Servine', 'Grass', 'Uncommon', '/servine-pokemon-card.png', 80, 60, 75, 20, 5, 'Stage1'),
('Serperior', 'Grass', 'Rare', '/serperior-pokemon-card.png', 115, 75, 95, 45, 5, 'Stage2'),
('Tepig', 'Fire', 'Common', '/tepig-pokemon-card.png', 65, 63, 45, 8, 5, 'Basic'),
('Pignite', 'Fire', 'Uncommon', '/pignite-pokemon-card.png', 110, 93, 55, 20, 5, 'Stage1'),
('Emboar', 'Fire', 'Rare', '/emboar-pokemon-card.png', 140, 123, 65, 45, 5, 'Stage2'),
('Oshawott', 'Water', 'Common', '/oshawott-pokemon-card.png', 55, 55, 45, 8, 5, 'Basic'),
('Dewott', 'Water', 'Uncommon', '/dewott-pokemon-card.png', 95, 75, 60, 20, 5, 'Stage1'),
('Samurott', 'Water', 'Rare', '/samurott-pokemon-card.png', 135, 100, 85, 45, 5, 'Stage2'),
('Reshiram', 'Fire', 'Legendary', '/reshiram-pokemon-card.png', 100, 120, 100, 130, 5, 'Basic'),
('Zekrom', 'Electric', 'Legendary', '/zekrom-pokemon-card.png', 100, 150, 120, 130, 5, 'Basic'),
('Kyurem', 'Ice', 'Legendary', '/kyurem-pokemon-card.png', 125, 130, 90, 130, 5, 'Basic'),
('Victini', 'Psychic', 'Mythic', '/victini-pokemon-card.png', 100, 100, 100, 170, 5, 'Basic'),
('Keldeo', 'Water', 'Mythic', '/keldeo-pokemon-card.png', 91, 72, 90, 160, 5, 'Basic'),
('Meloetta', 'Psychic', 'Mythic', '/meloetta-pokemon-card.png', 100, 77, 77, 160, 5, 'Basic'),
('Genesect', 'Bug', 'Mythic', '/genesect-pokemon-card.png', 71, 120, 95, 180, 5, 'Basic'),

-- Generation 6 Pokemon
('Chespin', 'Grass', 'Common', '/chespin-pokemon-card.png', 56, 61, 65, 8, 6, 'Basic'),
('Quilladin', 'Grass', 'Uncommon', '/quilladin-pokemon-card.png', 101, 78, 95, 20, 6, 'Stage1'),
('Chesnaught', 'Grass', 'Rare', '/chesnaught-pokemon-card.png', 138, 107, 122, 45, 6, 'Stage2'),
('Fennekin', 'Fire', 'Common', '/fennekin-pokemon-card.png', 40, 45, 40, 8, 6, 'Basic'),
('Braixen', 'Fire', 'Uncommon', '/braixen-pokemon-card.png', 79, 59, 58, 20, 6, 'Stage1'),
('Delphox', 'Fire', 'Rare', '/delphox-pokemon-card.png', 104, 69, 72, 45, 6, 'Stage2'),
('Froakie', 'Water', 'Common', '/froakie-pokemon-card.png', 41, 56, 40, 8, 6, 'Basic'),
('Frogadier', 'Water', 'Uncommon', '/frogadier-pokemon-card.png', 71, 97, 52, 20, 6, 'Stage1'),
('Greninja', 'Water', 'Rare', '/greninja-pokemon-card.png', 101, 95, 67, 45, 6, 'Stage2'),
('Xerneas', 'Fairy', 'Legendary', '/xerneas-pokemon-card.png', 126, 131, 95, 130, 6, 'Basic'),
('Yveltal', 'Dark', 'Legendary', '/yveltal-pokemon-card.png', 126, 131, 95, 130, 6, 'Basic'),
('Zygarde', 'Dragon', 'Legendary', '/zygarde-pokemon-card.png', 108, 100, 121, 130, 6, 'Basic'),
('Diancie', 'Rock', 'Mythic', '/diancie-pokemon-card.png', 50, 100, 150, 170, 6, 'Basic'),
('Hoopa', 'Psychic', 'Mythic', '/hoopa-pokemon-card.png', 80, 110, 60, 180, 6, 'Basic'),
('Volcanion', 'Fire', 'Mythic', '/volcanion-pokemon-card.png', 80, 110, 120, 180, 6, 'Basic'),

-- Special Variants and Shinies
('Shiny Charizard', 'Fire', 'Epic', '/shiny-charizard-pokemon-card.png', 120, 130, 100, 150, 1, 'Stage2'),
('Shiny Mewtwo', 'Psychic', 'Epic', '/shiny-mewtwo-pokemon-card.png', 130, 150, 90, 200, 1, 'Basic'),
('Shadow Lugia', 'Dark', 'Epic', '/shadow-lugia-pokemon-card.png', 106, 90, 130, 180, 2, 'Basic'),
('Golden Magikarp', 'Water', 'Epic', '/golden-magikarp-pokemon-card.png', 20, 10, 55, 100, 1, 'Basic'),
('Crystal Onix', 'Rock', 'Epic', '/crystal-onix-pokemon-card.png', 35, 45, 160, 120, 1, 'Basic'),

-- Rare Type Combinations
('Rotom', 'Electric', 'Uncommon', '/rotom-pokemon-card.png', 50, 50, 77, 25, 4, 'Basic'),
('Spiritomb', 'Ghost', 'Rare', '/spiritomb-pokemon-card.png', 50, 92, 108, 40, 4, 'Basic'),
('Bronzong', 'Steel', 'Uncommon', '/bronzong-pokemon-card.png', 67, 89, 116, 30, 4, 'Stage1'),
('Bronzor', 'Steel', 'Common', '/bronzor-pokemon-card.png', 57, 24, 86, 12, 4, 'Basic'),
('Lucario', 'Fighting', 'Rare', '/lucario-pokemon-card.png', 70, 110, 70, 50, 4, 'Stage1'),
('Riolu', 'Fighting', 'Common', '/riolu-pokemon-card.png', 40, 70, 40, 15, 4, 'Basic'),
('Garchomp', 'Dragon', 'Rare', '/garchomp-pokemon-card.png', 108, 130, 95, 55, 4, 'Stage2'),
('Gabite', 'Dragon', 'Uncommon', '/gabite-pokemon-card.png', 68, 90, 65, 28, 4, 'Stage1'),
('Gible', 'Dragon', 'Common', '/gible-pokemon-card.png', 58, 70, 45, 12, 4, 'Basic'),

-- Legendary Trio Additions
('Entei', 'Fire', 'Legendary', '/entei-pokemon-card.png', 115, 115, 85, 100, 2, 'Basic'),
('Raikou', 'Electric', 'Legendary', '/raikou-pokemon-card.png', 90, 85, 75, 100, 2, 'Basic'),
('Suicune', 'Water', 'Legendary', '/suicune-pokemon-card.png', 100, 75, 115, 100, 2, 'Basic'),
('Regice', 'Ice', 'Legendary', '/regice-pokemon-card.png', 80, 50, 100, 90, 3, 'Basic'),
('Regirock', 'Rock', 'Legendary', '/regirock-pokemon-card.png', 80, 100, 200, 90, 3, 'Basic'),
('Registeel', 'Steel', 'Legendary', '/registeel-pokemon-card.png', 80, 75, 150, 90, 3, 'Basic'),

-- Ultra Rare Cards
('Ancient Mew', 'Psychic', 'Mythic', '/ancient-mew-pokemon-card.png', 30, 40, 40, 300, 1, 'Basic'),
('Missingno', 'Normal', 'Mythic', '/missingno-pokemon-card.png', 999, 999, 999, 500, 1, 'Basic');
