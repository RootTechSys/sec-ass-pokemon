import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { card_id, seller_id, price, quantity } = await request.json()

    if (price <= 0 || quantity <= 0) {
      return NextResponse.json({ error: "Invalid price or quantity" }, { status: 400 })
    }

    const userCard = await query("SELECT id, quantity FROM user_cards WHERE user_id = ? AND card_id = ?", [
      seller_id,
      card_id,
    ])

    if (!userCard[0] || userCard[0].quantity < quantity) {
      return NextResponse.json({ error: "Insufficient cards to sell" }, { status: 400 })
    }

    await query("START TRANSACTION")

    try {
      await query("UPDATE user_cards SET quantity = quantity - ? WHERE id = ?", [quantity, userCard[0].id])

      if (userCard[0].quantity === quantity) {
        await query("DELETE FROM user_cards WHERE id = ?", [userCard[0].id])
      }

      const existingListing = await query(
        "SELECT id, quantity FROM market_listings WHERE seller_id = ? AND card_id = ? AND price = ?",
        [seller_id, card_id, price],
      )

      if (existingListing[0]) {
        await query("UPDATE market_listings SET quantity = quantity + ? WHERE id = ?", [
          quantity,
          existingListing[0].id,
        ])
      } else {
        await query("INSERT INTO market_listings (card_id, seller_id, price, quantity) VALUES (?, ?, ?, ?)", [
          card_id,
          seller_id,
          price,
          quantity,
        ])
      }

      await query("COMMIT")

      return NextResponse.json({ success: true })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to sell card" }, { status: 500 })
  }
}
