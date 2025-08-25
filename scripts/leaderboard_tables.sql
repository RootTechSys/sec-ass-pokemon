CREATE TABLE IF NOT EXISTS seasons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    season_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    rewards_distributed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_titles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_active (user_id, active)
);

CREATE TABLE IF NOT EXISTS battle_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id INT NOT NULL,
    player2_id INT NOT NULL,
    winner_id INT NOT NULL,
    battle_type ENUM('pvp', 'tournament', 'challenge') DEFAULT 'pvp',
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_winner_date (winner_id, created_at),
    INDEX idx_battle_type (battle_type)
);

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leaderboard_type ENUM('battle', 'collection', 'trading', 'overall') NOT NULL,
    score INT NOT NULL,
    rank_position INT NOT NULL,
    timeframe ENUM('daily', 'weekly', 'monthly', 'season') NOT NULL,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_snapshot (user_id, leaderboard_type, timeframe, snapshot_date),
    INDEX idx_leaderboard_date (leaderboard_type, timeframe, snapshot_date),
    INDEX idx_rank (rank_position)
);

INSERT INTO seasons (season_number, name, start_date, end_date) VALUES
(1, 'Temporada Inaugural', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY));

INSERT INTO user_titles (user_id, title, description, active) VALUES
(1, 'Mestre Pokémon', 'Conquistou o primeiro lugar no ranking geral', TRUE),
(2, 'Colecionador Supremo', 'Possui mais de 100 cartas únicas', FALSE),
(3, 'Comerciante Lendário', 'Realizou mais de 50 trocas bem-sucedidas', FALSE);

INSERT INTO battle_history (player1_id, player2_id, winner_id, battle_type, duration_seconds) VALUES
(1, 2, 1, 'pvp', 180),
(2, 3, 2, 'pvp', 240),
(3, 4, 3, 'tournament', 300),
(1, 3, 1, 'pvp', 150),
(2, 4, 4, 'pvp', 200),
(1, 4, 1, 'tournament', 280);
