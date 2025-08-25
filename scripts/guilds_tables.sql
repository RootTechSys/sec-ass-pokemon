CREATE TABLE IF NOT EXISTS guilds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    requirements TEXT,
    leader_id INT NOT NULL,
    max_members INT DEFAULT 20,
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_level (level),
    INDEX idx_public (is_public)
);

CREATE TABLE IF NOT EXISTS guild_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guild_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('leader', 'officer', 'member') DEFAULT 'member',
    contribution_points INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member (guild_id, user_id),
    INDEX idx_guild_role (guild_id, role),
    INDEX idx_contribution (contribution_points)
);

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
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_guild_status (guild_id, status),
    INDEX idx_user_status (user_id, status)
);

CREATE TABLE IF NOT EXISTS guild_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guild_id INT NOT NULL,
    user_id INT NOT NULL,
    activity_type ENUM('joined', 'left', 'promoted', 'demoted', 'contribution', 'achievement') NOT NULL,
    description TEXT,
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_guild_date (guild_id, created_at),
    INDEX idx_activity_type (activity_type)
);

INSERT INTO guilds (name, description, leader_id, max_members, level, experience, is_public) VALUES
('Mestres Pokémon', 'Guilda para treinadores experientes que buscam dominar todas as estratégias de batalha', 1, 25, 5, 2500, TRUE),
('Coletores Unidos', 'Focamos em completar a Pokédex e trocar cartas raras entre membros', 2, 30, 3, 1200, TRUE),
('Academia de Batalha', 'Treinamento intensivo em combates e torneios competitivos', 3, 20, 4, 1800, TRUE),
('Exploradores Novatos', 'Guilda acolhedora para novos treinadores aprenderem juntos', 4, 40, 2, 600, TRUE);

INSERT INTO guild_members (guild_id, user_id, role, contribution_points) VALUES
(1, 1, 'leader', 500),
(1, 2, 'officer', 300),
(1, 3, 'member', 150),
(2, 2, 'leader', 400),
(2, 4, 'member', 200),
(3, 3, 'leader', 350),
(4, 4, 'leader', 250);
