import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const query = `
      SELECT 
        t.id,
        u1.username as requester_username,
        u2.username as target_username,
        t.status,
        t.created_at
      FROM trades t
      JOIN users u1 ON t.requester_id = u1.id
      JOIN users u2 ON t.target_id = u2.id
      ORDER BY t.created_at DESC
      LIMIT 50
    `

    const trades = await executeQuery(query)
    return NextResponse.json(trades)
  } catch (error) {
    console.error("Admin trades error:", error)
    return NextResponse.json({ error: "Erro ao buscar trocas" }, { status: 500 })
  }
}
