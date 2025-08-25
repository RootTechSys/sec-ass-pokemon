import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { guild_id, user_id, message } = await request.json()

    const existingMember = await query("SELECT id FROM guild_members WHERE user_id = ?", [user_id])

    if (existingMember.length > 0) {
      return NextResponse.json({ error: "User is already in a guild" }, { status: 400 })
    }

    const existingApplication = await query(
      "SELECT id FROM guild_applications WHERE guild_id = ? AND user_id = ? AND status = 'pending'",
      [guild_id, user_id],
    )

    if (existingApplication.length > 0) {
      return NextResponse.json({ error: "Application already pending" }, { status: 400 })
    }

    await query(
      `INSERT INTO guild_applications (guild_id, user_id, message, status)
       VALUES (?, ?, ?, 'pending')`,
      [guild_id, user_id, message],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to apply to guild" }, { status: 500 })
  }
}
