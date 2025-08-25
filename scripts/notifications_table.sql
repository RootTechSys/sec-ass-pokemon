USE pokemon_cards;

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('trade', 'battle', 'achievement', 'pack', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_user_read (user_id, read_status)
);

INSERT INTO notifications (user_id, type, title, message, read_status) VALUES
(1, 'system', 'Bem-vindo ao PokéCards!', 'Comece sua jornada comprando seu primeiro pacote de cartas!', FALSE),
(1, 'achievement', 'Conquista Desbloqueada!', 'Você desbloqueou "Primeiro Passo" e ganhou 25 moedas!', FALSE),
(1, 'pack', 'Carta Rara Encontrada!', 'Você encontrou um Mewtwo lendário no seu último pacote!', TRUE);
