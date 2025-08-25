import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { listing_id, buyer_id } = await request.json()

    const listing = await query(
      `
      SELECT ml.*, c.name as card_name
      FROM market_listings ml
      INNER JOIN cards c ON ml.card_id = c.id
      WHERE ml.id = ? AND ml.quantity > 0
    `,
      [listing_id],
    )

    if (!listing[0]) {
      return NextResponse.json({ error: "Listing not found or out of stock" }, { status: 404 })
    }

    if (listing[0].seller_id === buyer_id) {
      return NextResponse.json({ error: "Cannot buy your own listing" }, { status: 400 })
    }

    const buyer = await query("SELECT coins FROM users WHERE id = ?", [buyer_id])

    if (!buyer[0] || buyer[0].coins < listing[0].price) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 400 })
    }

    await query("START TRANSACTION")

    try {
      await query("UPDATE users SET coins = coins - ? WHERE id = ?", [listing[0].price, buyer_id])

      await query("UPDATE users SET coins = coins + ? WHERE id = ?", [listing[0].price, listing[0].seller_id])

      const existingCard = await query("SELECT id, quantity FROM user_cards WHERE user_id = ? AND card_id = ?", [
        buyer_id,
        listing[0].card_id,
      ])

      if (existingCard[0]) {
        await query("UPDATE user_cards SET quantity = quantity + 1 WHERE id = ?", [existingCard[0].id])
      } else {
        await query("INSERT INTO user_cards (user_id, card_id, quantity) VALUES (?, ?, 1)", [
          buyer_id,
          listing[0].card_id,
        ])
      }

      if (listing[0].quantity === 1) {
        await query("DELETE FROM market_listings WHERE id = ?", [listing_id])
      } else {
        await query("UPDATE market_listings SET quantity = quantity - 1 WHERE id = ?", [listing_id])
      }

      await query("COMMIT")

      return NextResponse.json({ success: true })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to buy card" }, { status: 500 })
  }
}
