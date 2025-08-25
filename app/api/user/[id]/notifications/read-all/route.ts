import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    await executeQuery(`UPDATE notifications SET read_status = 1 WHERE user_id = ${userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    return NextResponse.json({ error: "Erro ao marcar notificações como lidas" }, { status: 500 })
  }
}
