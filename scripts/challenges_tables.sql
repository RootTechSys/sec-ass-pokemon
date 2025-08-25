CREATE TABLE IF NOT EXISTS daily_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('battle', 'collection', 'trade', 'pack', 'login') NOT NULL,
    target_value INT NOT NULL,
    reward_type ENUM('coins', 'pack', 'card') NOT NULL,
    reward_value INT NOT NULL,
    reward_description VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weekly_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('tournament', 'guild', 'marketplace', 'streak') NOT NULL,
    target_value INT NOT NULL,
    reward_type ENUM('coins', 'pack', 'card', 'title') NOT NULL,
    reward_value INT NOT NULL,
    reward_description VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_daily_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    current_progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    claimed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_challenge (user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS user_weekly_challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id INT NOT NULL,
    current_progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    claimed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES weekly_challenges(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_challenge (user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS user_challenge_streaks (
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

CREATE TABLE IF NOT EXISTS user_streak_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    streak_level INT NOT NULL,
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_streak_reward (user_id, streak_level)
);

INSERT INTO daily_challenges (title, description, type, target_value, reward_type, reward_value, reward_description, expires_at) VALUES
('Primeira Batalha', 'Vença sua primeira batalha do dia', 'battle', 1, 'coins', 50, '50 Moedas', DATE_ADD(NOW(), INTERVAL 1 DAY)),
('Colecionador Diário', 'Abra 2 pacotes de cartas', 'pack', 2, 'coins', 75, '75 Moedas', DATE_ADD(NOW(), INTERVAL 1 DAY)),
('Comerciante Ativo', 'Faça 1 troca com outro jogador', 'trade', 1, 'pack', 1, '1 Pacote Básico', DATE_ADD(NOW(), INTERVAL 1 DAY)),
('Login Diário', 'Faça login no jogo', 'login', 1, 'coins', 25, '25 Moedas', DATE_ADD(NOW(), INTERVAL 1 DAY));

INSERT INTO weekly_challenges (title, description, type, target_value, reward_type, reward_value, reward_description, expires_at) VALUES
('Campeão Semanal', 'Participe de 3 torneios', 'tournament', 3, 'coins', 500, '500 Moedas', DATE_ADD(NOW(), INTERVAL 7 DAY)),
('Membro Ativo', 'Contribua 100 pontos para sua guilda', 'guild', 100, 'pack', 2, '2 Pacotes Premium', DATE_ADD(NOW(), INTERVAL 7 DAY)),
('Negociador Mestre', 'Venda 10 cartas no marketplace', 'marketplace', 10, 'coins', 300, '300 Moedas', DATE_ADD(NOW(), INTERVAL 7 DAY)),
('Sequência Perfeita', 'Complete desafios diários por 7 dias seguidos', 'streak', 7, 'card', 1, 'Carta Épica Aleatória', DATE_ADD(NOW(), INTERVAL 7 DAY));
