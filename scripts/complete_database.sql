-- =====================================================
-- POKEMON CARDS APPLICATION - COMPLETE DATABASE SETUP
-- =====================================================
-- This script contains all database tables and data
-- Run this single script to set up the complete database
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS pokemon_cards;
USE pokemon_cards;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    coins INT DEFAULT 100,
    avatar VARCHAR(255),
    session_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pokemon cards table
CREATE TABLE pokemon_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    rarity ENUM('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic') NOT NULL,
    image VARCHAR(255),
    hp INT NOT NULL,
    attack INT NOT NULL,
    defense INT NOT NULL,
    price INT NOT NULL,
    generation INT DEFAULT 1,
    evolution_stage ENUM('Basic', 'Stage1', 'Stage2') DEFAULT 'Basic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User cards collection
CREATE TABLE user_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    quantity INT DEFAULT 1,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES pokemon_cards(id) ON DELETE CASCADE,
    INDEX idx_user_cards (user_id, card_id)
);

-- Trade offers
CREATE TABLE trade_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    offered_card_id INT NOT NULL,
    requested_card_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (offered_card_id) REFERENCES pokemon_cards(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_card_id) REFERENCES pokemon_cards(id) ON DELETE CASCADE
);

-- Pack purchases
CREATE TABLE pack_purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pack_type VARCHAR(50) NOT NULL,
    cost INT NOT NULL,
    cards_received JSON,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- ACHIEVEMENT SYSTEM TABLES
-- =====================================================

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- Battles
CREATE TABLE IF NOT EXISTS battles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    opponent_card_id INT NOT NULL,
    player_card_id INT NOT NULL,
    winner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opponent_card_id) REFERENCES pokemon_cards(id),
    FOREIGN KEY (player_card_id) REFERENCES pokemon_cards(id)
);

-- =====================================================
-- ADVANCED FEATURES TABLES
-- =====================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('trade', 'battle', 'achievement', 'pack', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    entry_fee INT DEFAULT 0,
    max_participants INT DEFAULT 16,
    current_participants INT DEFAULT 0,
    status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NULL,
    winner_id INT NULL,
    prize_pool INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- Tournament participants
CREATE TABLE IF NOT EXISTS tournament_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eliminated_at TIMESTAMP NULL,
    final_position INT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tournament_user (tournament_id, user_id)
);

-- Tournament matches
CREATE TABLE IF NOT EXISTS tournament_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    player1_id INT NOT NULL,
    player2_id INT NOT NULL,
    winner_id INT NULL,
    round_number INT NOT NULL,
    match_number INT NOT NULL,
    status ENUM('pending', 'active', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- Marketplace
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    card_id INT NOT NULL,
    price INT NOT NULL,
    quantity INT DEFAULT 1,
    status ENUM('active', 'sold', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP NULL,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES pokemon_cards(id) ON DELETE CASCADE
);

-- Marketplace transactions
CREATE TABLE IF NOT EXISTS marketplace_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    card_id INT NOT NULL,
    price INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES pokemon_cards(id)
);

-- Guilds
CREATE TABLE IF NOT EXISTS guilds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    leader_id INT NOT NULL,
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    member_count INT DEFAULT 1,
    max_members INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Guild members
CREATE TABLE IF NOT EXISTS guild_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guild_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('leader', 'officer', 'member') DEFAULT 'member',
    contribution_points INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_guild_user (guild_id, user_id)
);

-- Guild applications
CREATE TABLE IF NOT EXISTS guild_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guild_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT NULL,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    UNIQUE KEY unique_guild_application (guild_id, user_id)
);

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_type ENUM('battle', 'collect', 'trade', 'pack', 'login') NOT NULL,
    target_value INT NOT NULL,
    current_progress INT DEFAULT 0,
    reward_type ENUM('coins', 'pack', 'card') NOT NULL,
    reward_value INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_daily_challenge (user_id, challenge_type, date)
);

-- Weekly challenges
CREATE TABLE IF NOT EXISTS weekly_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_type ENUM('battle', 'collect', 'trade', 'pack', 'tournament') NOT NULL,
    target_value INT NOT NULL,
    current_progress INT DEFAULT 0,
    reward_type ENUM('coins', 'pack', 'card') NOT NULL,
    reward_value INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    week_start DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_weekly_challenge (user_id, challenge_type, week_start)
);

-- Challenge streaks
CREATE TABLE IF NOT EXISTS challenge_streaks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_completion_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_streak (user_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category ENUM('battle', 'collection', 'trading', 'guild') NOT NULL,
    score INT NOT NULL,
    rank_position INT NOT NULL,
    season VARCHAR(20) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category_season (user_id, category, season)
);

-- Season stats
CREATE TABLE IF NOT EXISTS season_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    season VARCHAR(20) NOT NULL,
    battles_won INT DEFAULT 0,
    battles_lost INT DEFAULT 0,
    cards_collected INT DEFAULT 0,
    trades_completed INT DEFAULT 0,
    packs_opened INT DEFAULT 0,
    tournaments_won INT DEFAULT 0,
    achievements_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_season (user_id, season)
);

-- =====================================================
-- POKEMON CARDS DATA
-- =====================================================

-- Insert all Pokemon cards data
INSERT INTO pokemon_cards (name, type, rarity, image, hp, attack, defense, price, generation, evolution_stage) VALUES
-- Original Generation 1 Pokemon
('Pikachu', 'Electric', 'Common', '/pikachu-pokemon-card.png', 60, 55, 40, 10, 1, 'Basic'),
('Charizard', 'Fire', 'Rare', '/charizard-pokemon-card.png', 120, 110, 100, 50, 1, 'Stage2'),
('Blastoise', 'Water', 'Rare', '/blastoise-pokemon-card.png', 140, 90, 105, 50, 1, 'Stage2'),
('Venusaur', 'Grass', 'Rare', '/venusaur-pokemon-card.png', 140, 100, 100, 50, 1, 'Stage2'),
('Mewtwo', 'Psychic', 'Legendary', '/mewtwo-pokemon-card.png', 106, 110, 90, 100, 1, 'Basic'),
('Mew', 'Psychic', 'Mythic', '/mew-pokemon-card.png', 100, 100, 100, 150, 1, 'Basic'),

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

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample users (for testing purposes)
INSERT INTO users (username, email, password_hash, coins) VALUES
('admin', 'admin@pokemon.com', '$2b$10$example_hash_admin', 10000),
('trainer1', 'trainer1@pokemon.com', '$2b$10$example_hash_1', 500),
('trainer2', 'trainer2@pokemon.com', '$2b$10$example_hash_2', 300);

-- Give sample users some cards
INSERT INTO user_cards (user_id, card_id, quantity) VALUES
(2, 1, 3), -- trainer1 has 3 Pikachu
(2, 2, 1), -- trainer1 has 1 Charizard
(2, 7, 2), -- trainer1 has 2 Treecko
(3, 1, 1), -- trainer2 has 1 Pikachu
(3, 3, 1), -- trainer2 has 1 Blastoise
(3, 8, 1); -- trainer2 has 1 Grovyle

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional indexes for better performance
CREATE INDEX idx_pokemon_cards_type ON pokemon_cards(type);
CREATE INDEX idx_pokemon_cards_rarity ON pokemon_cards(rarity);
CREATE INDEX idx_pokemon_cards_generation ON pokemon_cards(generation);
CREATE INDEX idx_trade_offers_status ON trade_offers(status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_guild_members_guild ON guild_members(guild_id);
CREATE INDEX idx_leaderboard_category_season ON leaderboard_entries(category, season);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Database setup completed successfully!
-- You can now run your Pokemon Cards application.
-- =====================================================
