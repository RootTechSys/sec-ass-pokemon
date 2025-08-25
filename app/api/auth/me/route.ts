import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback-secret") as any
    const userId = decoded.userId

    const userQuery = `SELECT id, username, email, coins, avatar FROM users WHERE id = ${userId}`
    const users = (await executeQuery(userQuery)) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Token inválido" }, { status: 401 })
  }
}
