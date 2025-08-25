"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, Clock, Star } from "lucide-react"

interface Tournament {
  id: number
  name: string
  description: string
  entry_fee: number
  prize_pool: number
  max_participants: number
  current_participants: number
  start_time: string
  end_time: string
  status: "upcoming" | "active" | "completed"
  rounds: number
  current_round: number
}

interface TournamentMatch {
  id: number
  tournament_id: number
  round: number
  player1_id: number
  player2_id: number
  player1_name: string
  player2_name: string
  winner_id?: number
  status: "pending" | "active" | "completed"
}

export default function TournamentSystem({ userId }: { userId: number }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [userTournaments, setUserTournaments] = useState<Tournament[]>([])
  const [matches, setMatches] = useState<TournamentMatch[]>([])
  const [activeTab, setActiveTab] = useState<"available" | "joined" | "matches">("available")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTournaments()
    fetchUserTournaments()
    fetchMatches()
  }, [userId])

  const fetchTournaments = async () => {
    try {
      const response = await fetch("/api/tournaments")
      const data = await response.json()
      setTournaments(data.tournaments || [])
    } catch (error) {
      console.error("Error fetching tournaments:", error)
    }
  }

  const fetchUserTournaments = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/tournaments`)
      const data = await response.json()
      setUserTournaments(data.tournaments || [])
    } catch (error) {
      console.error("Error fetching user tournaments:", error)
    }
  }

  const fetchMatches = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/matches`)
      const data = await response.json()
      setMatches(data.matches || [])
    } catch (error) {
      console.error("Error fetching matches:", error)
    }
  }

  const joinTournament = async (tournamentId: number) => {
    setLoading(true)
    try {
      const response = await fetch("/api/tournaments/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournament_id: tournamentId, user_id: userId }),
      })

      if (response.ok) {
        fetchTournaments()
        fetchUserTournaments()
      }
    } catch (error) {
      console.error("Error joining tournament:", error)
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Torneios</h2>
          <p className="text-gray-400">Participe de torneios e ganhe prêmios exclusivos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "available" ? "default" : "outline"}
            onClick={() => setActiveTab("available")}
            className="text-sm"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Disponíveis
          </Button>
          <Button
            variant={activeTab === "joined" ? "default" : "outline"}
            onClick={() => setActiveTab("joined")}
            className="text-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Inscritos
          </Button>
          <Button
            variant={activeTab === "matches" ? "default" : "outline"}
            onClick={() => setActiveTab("matches")}
            className="text-sm"
          >
            <Star className="w-4 h-4 mr-2" />
            Partidas
          </Button>
        </div>
      </div>

      {activeTab === "available" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">{tournament.name}</CardTitle>
                  <Badge className={getStatusColor(tournament.status)}>
                    {tournament.status === "upcoming"
                      ? "Em breve"
                      : tournament.status === "active"
                        ? "Ativo"
                        : "Finalizado"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">{tournament.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Taxa de Entrada</p>
                    <p className="text-white font-semibold">{tournament.entry_fee} moedas</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Prêmio</p>
                    <p className="text-yellow-400 font-semibold">{tournament.prize_pool} moedas</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Participantes</span>
                    <span className="text-white">
                      {tournament.current_participants}/{tournament.max_participants}
                    </span>
                  </div>
                  <Progress
                    value={(tournament.current_participants / tournament.max_participants) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Início: {formatDate(tournament.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Fim: {formatDate(tournament.end_time)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => joinTournament(tournament.id)}
                  disabled={
                    loading ||
                    tournament.status !== "upcoming" ||
                    tournament.current_participants >= tournament.max_participants
                  }
                  className="w-full"
                >
                  {loading ? "Inscrevendo..." : "Inscrever-se"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "joined" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userTournaments.map((tournament) => (
            <Card key={tournament.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">{tournament.name}</CardTitle>
                  <Badge className={getStatusColor(tournament.status)}>
                    {tournament.status === "upcoming"
                      ? "Em breve"
                      : tournament.status === "active"
                        ? "Ativo"
                        : "Finalizado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Rodada Atual</p>
                    <p className="text-white font-semibold">
                      {tournament.current_round}/{tournament.rounds}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Participantes</p>
                    <p className="text-white font-semibold">{tournament.current_participants}</p>
                  </div>
                </div>

                <Progress value={(tournament.current_round / tournament.rounds) * 100} className="h-2" />

                <div className="text-sm text-gray-400">
                  Status:{" "}
                  {tournament.status === "active"
                    ? "Em andamento"
                    : tournament.status === "upcoming"
                      ? "Aguardando início"
                      : "Finalizado"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "matches" && (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-white font-semibold">{match.player1_name}</p>
                      <p className="text-sm text-gray-400">Jogador 1</p>
                    </div>
                    <div className="text-2xl text-gray-400">VS</div>
                    <div className="text-center">
                      <p className="text-white font-semibold">{match.player2_name}</p>
                      <p className="text-sm text-gray-400">Jogador 2</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-sm">
                      Rodada {match.round}
                    </Badge>
                    <Badge
                      className={
                        match.status === "pending"
                          ? "bg-yellow-500"
                          : match.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-500"
                      }
                    >
                      {match.status === "pending" ? "Pendente" : match.status === "active" ? "Ativa" : "Finalizada"}
                    </Badge>
                    {match.status === "active" && <Button size="sm">Jogar</Button>}
                  </div>
                </div>

                {match.winner_id && (
                  <div className="mt-4 p-3 bg-green-900/20 border border-green-500/20 rounded">
                    <p className="text-green-400 text-sm">
                      Vencedor: {match.winner_id === match.player1_id ? match.player1_name : match.player2_name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {matches.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma partida encontrada</p>
                <p className="text-sm text-gray-500 mt-2">Inscreva-se em torneios para começar a jogar!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
