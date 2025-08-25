import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notificationId = params.id

    await executeQuery(`UPDATE notifications SET read_status = 1 WHERE id = ${notificationId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notification read error:", error)
    return NextResponse.json({ error: "Erro ao marcar notificação como lida" }, { status: 500 })
  }
}
