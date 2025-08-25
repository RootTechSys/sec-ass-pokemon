"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Zap, Target } from "lucide-react"

interface LeaderboardEntry {
  id: number
  user_id: number
  username: string
  avatar?: string
  score: number
  rank: number
  change: number
  guild_name?: string
  level: number
  title?: string
}

interface GuildLeaderboard {
  id: number
  guild_id: number
  guild_name: string
  total_score: number
  member_count: number
  average_score: number
  rank: number
  change: number
  level: number
}

interface SeasonStats {
  current_season: number
  season_start: string
  season_end: string
  total_players: number
  your_rank?: number
  your_score?: number
}

export default function LeaderboardSystem({ userId }: { userId: number }) {
  const [battleLeaderboard, setBattleLeaderboard] = useState<LeaderboardEntry[]>([])
  const [collectionLeaderboard, setCollectionLeaderboard] = useState<LeaderboardEntry[]>([])
  const [tradingLeaderboard, setTradingLeaderboard] = useState<LeaderboardEntry[]>([])
  const [guildLeaderboard, setGuildLeaderboard] = useState<GuildLeaderboard[]>([])
  const [seasonStats, setSeasonStats] = useState<SeasonStats | null>(null)
  const [activeTab, setActiveTab] = useState<"battle" | "collection" | "trading" | "guilds">("battle")
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "all-time">("weekly")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLeaderboards()
    fetchSeasonStats()
  }, [timeframe])

  const fetchLeaderboards = async () => {
    setLoading(true)
    try {
      const [battleRes, collectionRes, tradingRes, guildRes] = await Promise.all([
        fetch(`/api/leaderboard/battle?timeframe=${timeframe}`),
        fetch(`/api/leaderboard/collection?timeframe=${timeframe}`),
        fetch(`/api/leaderboard/trading?timeframe=${timeframe}`),
        fetch(`/api/leaderboard/guilds?timeframe=${timeframe}`),
      ])

      const [battleData, collectionData, tradingData, guildData] = await Promise.all([
        battleRes.json(),
        collectionRes.json(),
        tradingRes.json(),
        guildRes.json(),
      ])

      setBattleLeaderboard(battleData.leaderboard || [])
      setCollectionLeaderboard(collectionData.leaderboard || [])
      setTradingLeaderboard(tradingData.leaderboard || [])
      setGuildLeaderboard(guildData.leaderboard || [])
    } catch (error) {
      console.error("Error fetching leaderboards:", error)
    }
    setLoading(false)
  }

  const fetchSeasonStats = async () => {
    try {
      const response = await fetch(`/api/leaderboard/season?user_id=${userId}`)
      const data = await response.json()
      setSeasonStats(data.season || null)
    } catch (error) {
      console.error("Error fetching season stats:", error)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600"
      default:
        return "bg-gray-100"
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else if (change < 0) {
      return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
    }
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />
  }

  const formatScore = (score: number, type: string) => {
    switch (type) {
      case "battle":
        return `${score} vitórias`
      case "collection":
        return `${score} cartas`
      case "trading":
        return `${score} trocas`
      default:
        return score.toString()
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "battle":
        return <Zap className="w-4 h-4" />
      case "collection":
        return <Star className="w-4 h-4" />
      case "trading":
        return <Target className="w-4 h-4" />
      case "guilds":
        return <Users className="w-4 h-4" />
      default:
        return null
    }
  }

  const renderLeaderboard = (leaderboard: LeaderboardEntry[], type: string) => (
    <div className="space-y-3">
      {leaderboard.map((entry, index) => (
        <Card
          key={entry.id}
          className={`${
            entry.user_id === userId ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white"
          } hover:shadow-md transition-shadow`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{entry.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{entry.username}</p>
                      {entry.user_id === userId && <Badge variant="outline">Você</Badge>}
                      {entry.title && <Badge className="bg-purple-100 text-purple-800">{entry.title}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Nível {entry.level}</span>
                      {entry.guild_name && (
                        <>
                          <span>•</span>
                          <span>{entry.guild_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-gray-900">{formatScore(entry.score, type)}</p>
                  {getChangeIcon(entry.change)}
                </div>
                <p className="text-sm text-gray-600">
                  {entry.change > 0 && "+"}
                  {entry.change !== 0 ? entry.change : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {leaderboard.length === 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum dado disponível para este período</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Rankings</h2>
          <p className="text-gray-400">Veja os melhores jogadores e guildas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeframe === "daily" ? "default" : "outline"}
            onClick={() => setTimeframe("daily")}
            size="sm"
          >
            Diário
          </Button>
          <Button
            variant={timeframe === "weekly" ? "default" : "outline"}
            onClick={() => setTimeframe("weekly")}
            size="sm"
          >
            Semanal
          </Button>
          <Button
            variant={timeframe === "monthly" ? "default" : "outline"}
            onClick={() => setTimeframe("monthly")}
            size="sm"
          >
            Mensal
          </Button>
          <Button
            variant={timeframe === "all-time" ? "default" : "outline"}
            onClick={() => setTimeframe("all-time")}
            size="sm"
          >
            Geral
          </Button>
        </div>
      </div>

      {seasonStats && (
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Temporada {seasonStats.current_season}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-white">{seasonStats.your_rank || "—"}</p>
                <p className="text-sm text-gray-400">Sua Posição</p>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-white">{seasonStats.your_score || "—"}</p>
                <p className="text-sm text-gray-400">Sua Pontuação</p>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-white">{seasonStats.total_players}</p>
                <p className="text-sm text-gray-400">Total de Jogadores</p>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-white">
                  {Math.ceil((new Date(seasonStats.season_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-sm text-gray-400">Dias Restantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700">
              <TabsTrigger value="battle" className="flex items-center gap-2">
                {getTabIcon("battle")}
                <span className="hidden sm:inline">Batalhas</span>
              </TabsTrigger>
              <TabsTrigger value="collection" className="flex items-center gap-2">
                {getTabIcon("collection")}
                <span className="hidden sm:inline">Coleção</span>
              </TabsTrigger>
              <TabsTrigger value="trading" className="flex items-center gap-2">
                {getTabIcon("trading")}
                <span className="hidden sm:inline">Trocas</span>
              </TabsTrigger>
              <TabsTrigger value="guilds" className="flex items-center gap-2">
                {getTabIcon("guilds")}
                <span className="hidden sm:inline">Guildas</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="battle" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Ranking de Batalhas</h3>
                  <p className="text-gray-400 text-sm">Baseado no número de vitórias em batalhas</p>
                </div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-white">Carregando...</div>
                  </div>
                ) : (
                  renderLeaderboard(battleLeaderboard, "battle")
                )}
              </TabsContent>

              <TabsContent value="collection" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Ranking de Coleção</h3>
                  <p className="text-gray-400 text-sm">Baseado no número total de cartas únicas</p>
                </div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-white">Carregando...</div>
                  </div>
                ) : (
                  renderLeaderboard(collectionLeaderboard, "collection")
                )}
              </TabsContent>

              <TabsContent value="trading" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Ranking de Trocas</h3>
                  <p className="text-gray-400 text-sm">Baseado no número de trocas realizadas</p>
                </div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-white">Carregando...</div>
                  </div>
                ) : (
                  renderLeaderboard(tradingLeaderboard, "trading")
                )}
              </TabsContent>

              <TabsContent value="guilds" className="mt-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Ranking de Guildas</h3>
                  <p className="text-gray-400 text-sm">Baseado na pontuação total dos membros</p>
                </div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-white">Carregando...</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guildLeaderboard.map((guild) => (
                      <Card key={guild.id} className="bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankColor(
                                  guild.rank,
                                )}`}
                              >
                                {getRankIcon(guild.rank)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{guild.guild_name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>{guild.member_count} membros</span>
                                  <span>•</span>
                                  <span>Nível {guild.level}</span>
                                  <span>•</span>
                                  <span>Média: {guild.average_score}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-bold text-gray-900">{guild.total_score} pts</p>
                                {getChangeIcon(guild.change)}
                              </div>
                              <p className="text-sm text-gray-600">
                                {guild.change > 0 && "+"}
                                {guild.change !== 0 ? guild.change : "—"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {guildLeaderboard.length === 0 && (
                      <Card className="bg-gray-50">
                        <CardContent className="p-8 text-center">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Nenhuma guilda encontrada</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
