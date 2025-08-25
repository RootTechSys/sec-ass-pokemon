import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    const existingUser = (await executeQuery(
      `SELECT id FROM users WHERE username = '${username}' OR email = '${email}'`,
    )) as any[]

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Usuário ou email já existe" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const query = `INSERT INTO users (username, email, password_hash, coins) VALUES ('${username}', '${email}', '${hashedPassword}', 100)`
    await executeQuery(query)

    return NextResponse.json({ message: "Usuário criado com sucesso" })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
