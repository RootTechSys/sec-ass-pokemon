import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notificationId = params.id

    await executeQuery(`DELETE FROM notifications WHERE id = ${notificationId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete notification error:", error)
    return NextResponse.json({ error: "Erro ao deletar notificação" }, { status: 500 })
  }
}
