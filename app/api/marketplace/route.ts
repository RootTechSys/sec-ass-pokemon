import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || "all"
    const rarity = searchParams.get("rarity") || "all"
    const sort = searchParams.get("sort") || "price_asc"

    let whereClause = "WHERE ml.quantity > 0"
    const params: any[] = []

    if (search) {
      whereClause += " AND c.name LIKE ?"
      params.push(`%${search}%`)
    }

    if (type !== "all") {
      whereClause += " AND c.type = ?"
      params.push(type)
    }

    if (rarity !== "all") {
      whereClause += " AND c.rarity = ?"
      params.push(rarity)
    }

    let orderClause = ""
    switch (sort) {
      case "price_asc":
        orderClause = "ORDER BY ml.price ASC"
        break
      case "price_desc":
        orderClause = "ORDER BY ml.price DESC"
        break
      case "name_asc":
        orderClause = "ORDER BY c.name ASC"
        break
      case "name_desc":
        orderClause = "ORDER BY c.name DESC"
        break
      case "newest":
        orderClause = "ORDER BY ml.created_at DESC"
        break
      default:
        orderClause = "ORDER BY ml.price ASC"
    }

    const listings = await query(
      `
      SELECT ml.*, 
             c.name as card_name, c.type as card_type, c.rarity as card_rarity, 
             c.image as card_image, c.hp as card_hp, c.attack as card_attack, c.defense as card_defense,
             u.username as seller_name
      FROM market_listings ml
      INNER JOIN cards c ON ml.card_id = c.id
      INNER JOIN users u ON ml.seller_id = u.id
      ${whereClause}
      ${orderClause}
    `,
      params,
    )

    return NextResponse.json({ listings })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
  }
}
