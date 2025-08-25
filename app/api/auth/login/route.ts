import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const query = `SELECT * FROM users WHERE username = '${username}'`
    const users = (await executeQuery(query)) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
    }

    const user = users[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Senha inválida" }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.NEXTAUTH_SECRET || "fallback-secret",
      { expiresIn: "24h" },
    )

    const sessionQuery = `INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (${user.id}, '${token}', DATE_ADD(NOW(), INTERVAL 24 HOUR))`
    await executeQuery(sessionQuery)

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        avatar: user.avatar,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
