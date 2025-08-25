import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    await executeQuery(`DELETE FROM user_cards WHERE user_id = ${userId}`)
    await executeQuery(`DELETE FROM trades WHERE requester_id = ${userId} OR target_id = ${userId}`)
    await executeQuery(`DELETE FROM users WHERE id = ${userId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete user error:", error)
    return NextResponse.json({ error: "Erro ao deletar usuário" }, { status: 500 })
  }
}
