import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any
    const userId = decoded.userId
    const tradeId = params.id

    const tradeQuery = `SELECT * FROM trade_offers WHERE id = ${tradeId} AND to_user_id = ${userId} AND status = 'pending'`
    const trades = (await executeQuery(tradeQuery)) as any[]

    if (trades.length === 0) {
      return NextResponse.json({ error: "Proposta de troca não encontrada" }, { status: 404 })
    }

    await executeQuery(`UPDATE trade_offers SET status = 'rejected' WHERE id = ${tradeId}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Trade reject error:", error)
    return NextResponse.json({ error: "Erro ao rejeitar troca" }, { status: 500 })
  }
}
