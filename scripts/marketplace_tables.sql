CREATE TABLE IF NOT EXISTS market_listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_id INT NOT NULL,
    seller_id INT NOT NULL,
    price INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_card_price (card_id, price),
    INDEX idx_seller (seller_id),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS market_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    card_id INT NOT NULL,
    price INT NOT NULL,
    quantity INT DEFAULT 1,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    INDEX idx_buyer (buyer_id),
    INDEX idx_seller (seller_id),
    INDEX idx_transaction_date (transaction_date)
);

INSERT INTO market_listings (card_id, seller_id, price, quantity) VALUES
(1, 2, 150, 2),
(3, 3, 300, 1),
(5, 2, 500, 1),
(7, 4, 200, 3),
(10, 3, 800, 1),
(12, 2, 100, 5),
(15, 4, 1200, 1),
(18, 3, 250, 2),
(20, 2, 600, 1),
(22, 4, 350, 2);
