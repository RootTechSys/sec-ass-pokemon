import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    const query = `
      SELECT achievement_id, progress, completed, claimed_at
      FROM user_achievements 
      WHERE user_id = ${userId}
    `

    const achievements = await executeQuery(query)
    return NextResponse.json(achievements)
  } catch (error) {
    console.error("User achievements error:", error)
    return NextResponse.json({ error: "Erro ao buscar conquistas" }, { status: 500 })
  }
}
