"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface User {
  id: number
  username: string
  email: string
  coins: number
  created_at: string
  total_cards: number
}

interface Trade {
  id: number
  requester_username: string
  target_username: string
  status: string
  created_at: string
}

interface Stats {
  totalUsers: number
  totalCards: number
  totalTrades: number
  totalCoins: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalCards: 0, totalTrades: 0, totalCoins: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.username !== "admin") {
      router.push("/")
      return
    }

    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      const [usersRes, tradesRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/trades"),
        fetch("/api/stats"),
      ])

      const usersData = await usersRes.json()
      const tradesData = await tradesRes.json()
      const statsData = await statsRes.json()

      setUsers(usersData)
      setTrades(tradesData)
      setStats(statsData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserCoins = async (userId: number, coins: number) => {
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, coins }),
      })
      fetchData()
    } catch (error) {
      console.error("Erro ao atualizar moedas:", error)
    }
  }

  const deleteUser = async (userId: number) => {
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Erro ao deletar usuário:", error)
    }
  }

  if (!user || user.username !== "admin") {
    return <div className="p-8">Acesso negado</div>
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Cartas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCards}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Trocas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Moedas em Circulação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCoins}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="trades">Trocas</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>Visualize e gerencie todos os usuários da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{user.username}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm">
                        Cartas: {user.total_cards} | Moedas: {user.coins}
                      </p>
                      <p className="text-xs text-gray-500">
                        Criado em: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Moedas"
                        className="w-20"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const coins = Number.parseInt((e.target as HTMLInputElement).value)
                            if (!isNaN(coins)) {
                              updateUserCoins(user.id, coins)
                            }
                          }
                        }}
                      />
                      <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id)}>
                        Deletar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Trocas</CardTitle>
              <CardDescription>Monitore todas as trocas realizadas na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {trade.requester_username} → {trade.target_username}
                      </p>
                      <p className="text-sm text-gray-600">{new Date(trade.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge
                      variant={
                        trade.status === "accepted"
                          ? "default"
                          : trade.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {trade.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
