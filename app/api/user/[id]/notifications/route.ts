import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    const query = `
      SELECT 
        id,
        type,
        title,
        message,
        read_status as read,
        created_at as createdAt,
        data
      FROM notifications 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `

    const notifications = await executeQuery(query)
    return NextResponse.json(notifications)
  } catch (error) {
    console.error("User notifications error:", error)
    return NextResponse.json([])
  }
}
