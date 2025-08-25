"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Trophy, Target, Gift, Clock, Star, Zap } from "lucide-react"

interface DailyChallenge {
  id: number
  title: string
  description: string
  type: "battle" | "collection" | "trade" | "pack" | "login"
  target_value: number
  current_progress: number
  reward_type: "coins" | "pack" | "card"
  reward_value: number
  reward_description: string
  expires_at: string
  completed: boolean
  claimed: boolean
}

interface WeeklyChallenge {
  id: number
  title: string
  description: string
  type: "tournament" | "guild" | "marketplace" | "streak"
  target_value: number
  current_progress: number
  reward_type: "coins" | "pack" | "card" | "title"
  reward_value: number
  reward_description: string
  expires_at: string
  completed: boolean
  claimed: boolean
}

interface ChallengeStreak {
  current_streak: number
  longest_streak: number
  last_completion_date: string
  streak_rewards_claimed: number[]
}

export default function DailyChallenges({ userId }: { userId: number }) {
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([])
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([])
  const [challengeStreak, setChallengeStreak] = useState<ChallengeStreak | null>(null)
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "streak">("daily")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDailyChallenges()
    fetchWeeklyChallenges()
    fetchChallengeStreak()
  }, [userId])

  const fetchDailyChallenges = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/challenges/daily`)
      const data = await response.json()
      setDailyChallenges(data.challenges || [])
    } catch (error) {
      console.error("Error fetching daily challenges:", error)
    }
  }

  const fetchWeeklyChallenges = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/challenges/weekly`)
      const data = await response.json()
      setWeeklyChallenges(data.challenges || [])
    } catch (error) {
      console.error("Error fetching weekly challenges:", error)
    }
  }

  const fetchChallengeStreak = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/challenges/streak`)
      const data = await response.json()
      setChallengeStreak(data.streak || null)
    } catch (error) {
      console.error("Error fetching challenge streak:", error)
    }
  }

  const claimReward = async (challengeId: number, type: "daily" | "weekly") => {
    setLoading(true)
    try {
      const response = await fetch("/api/challenges/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id: challengeId,
          user_id: userId,
          type: type,
        }),
      })

      if (response.ok) {
        if (type === "daily") {
          fetchDailyChallenges()
        } else {
          fetchWeeklyChallenges()
        }
        fetchChallengeStreak()
      }
    } catch (error) {
      console.error("Error claiming reward:", error)
    }
    setLoading(false)
  }

  const claimStreakReward = async (streakLevel: number) => {
    setLoading(true)
    try {
      const response = await fetch("/api/challenges/streak-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          streak_level: streakLevel,
        }),
      })

      if (response.ok) {
        fetchChallengeStreak()
      }
    } catch (error) {
      console.error("Error claiming streak reward:", error)
    }
    setLoading(false)
  }

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "battle":
        return <Zap className="w-5 h-5 text-red-400" />
      case "collection":
        return <Star className="w-5 h-5 text-yellow-400" />
      case "trade":
        return <Target className="w-5 h-5 text-blue-400" />
      case "pack":
        return <Gift className="w-5 h-5 text-purple-400" />
      case "login":
        return <Clock className="w-5 h-5 text-green-400" />
      case "tournament":
        return <Trophy className="w-5 h-5 text-gold-400" />
      case "guild":
        return <Target className="w-5 h-5 text-indigo-400" />
      case "marketplace":
        return <Gift className="w-5 h-5 text-pink-400" />
      case "streak":
        return <Calendar className="w-5 h-5 text-orange-400" />
      default:
        return <Target className="w-5 h-5 text-gray-400" />
    }
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "coins":
        return "💰"
      case "pack":
        return "📦"
      case "card":
        return "🎴"
      case "title":
        return "🏆"
      default:
        return "🎁"
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return "Expirado"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`
    }
    return `${minutes}m restantes`
  }

  const getStreakRewards = () => {
    return [
      { level: 3, reward: "100 moedas", claimed: challengeStreak?.streak_rewards_claimed.includes(3) || false },
      { level: 7, reward: "1 Pacote Básico", claimed: challengeStreak?.streak_rewards_claimed.includes(7) || false },
      { level: 14, reward: "300 moedas", claimed: challengeStreak?.streak_rewards_claimed.includes(14) || false },
      { level: 30, reward: "1 Pacote Premium", claimed: challengeStreak?.streak_rewards_claimed.includes(30) || false },
      { level: 50, reward: "Carta Lendária", claimed: challengeStreak?.streak_rewards_claimed.includes(50) || false },
    ]
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Desafios Diários</h2>
          <p className="text-gray-400">Complete desafios para ganhar recompensas exclusivas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "daily" ? "default" : "outline"}
            onClick={() => setActiveTab("daily")}
            className="text-sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Diários
          </Button>
          <Button
            variant={activeTab === "weekly" ? "default" : "outline"}
            onClick={() => setActiveTab("weekly")}
            className="text-sm"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Semanais
          </Button>
          <Button
            variant={activeTab === "streak" ? "default" : "outline"}
            onClick={() => setActiveTab("streak")}
            className="text-sm"
          >
            <Star className="w-4 h-4 mr-2" />
            Sequência
          </Button>
        </div>
      </div>

      {activeTab === "daily" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dailyChallenges.map((challenge) => (
            <Card
              key={challenge.id}
              className={`bg-gray-800 border-gray-700 ${challenge.completed ? "ring-2 ring-green-500/50" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getChallengeIcon(challenge.type)}
                    <CardTitle className="text-lg text-white">{challenge.title}</CardTitle>
                  </div>
                  {challenge.completed && !challenge.claimed && (
                    <Badge className="bg-green-500 text-white">Completo!</Badge>
                  )}
                  {challenge.claimed && <Badge className="bg-gray-500 text-white">Reivindicado</Badge>}
                </div>
                <p className="text-sm text-gray-400">{challenge.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-white">
                      {challenge.current_progress}/{challenge.target_value}
                    </span>
                  </div>
                  <Progress value={(challenge.current_progress / challenge.target_value) * 100} className="h-2" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getRewardIcon(challenge.reward_type)}</span>
                    <div>
                      <p className="text-white font-semibold">{challenge.reward_description}</p>
                      <p className="text-sm text-gray-400">Recompensa</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{getTimeRemaining(challenge.expires_at)}</p>
                  <Button
                    onClick={() => claimReward(challenge.id, "daily")}
                    disabled={loading || !challenge.completed || challenge.claimed}
                    size="sm"
                  >
                    {challenge.claimed ? "Reivindicado" : challenge.completed ? "Reivindicar" : "Em progresso"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {dailyChallenges.length === 0 && (
            <Card className="bg-gray-800 border-gray-700 col-span-full">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum desafio diário disponível</p>
                <p className="text-sm text-gray-500 mt-2">Novos desafios serão gerados em breve!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "weekly" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeklyChallenges.map((challenge) => (
            <Card
              key={challenge.id}
              className={`bg-gray-800 border-gray-700 ${challenge.completed ? "ring-2 ring-purple-500/50" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getChallengeIcon(challenge.type)}
                    <CardTitle className="text-xl text-white">{challenge.title}</CardTitle>
                  </div>
                  {challenge.completed && !challenge.claimed && (
                    <Badge className="bg-purple-500 text-white">Completo!</Badge>
                  )}
                  {challenge.claimed && <Badge className="bg-gray-500 text-white">Reivindicado</Badge>}
                </div>
                <p className="text-gray-400">{challenge.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-white">
                      {challenge.current_progress}/{challenge.target_value}
                    </span>
                  </div>
                  <Progress value={(challenge.current_progress / challenge.target_value) * 100} className="h-3" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getRewardIcon(challenge.reward_type)}</span>
                    <div>
                      <p className="text-white font-semibold text-lg">{challenge.reward_description}</p>
                      <p className="text-sm text-gray-400">Recompensa Semanal</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{getTimeRemaining(challenge.expires_at)}</p>
                  <Button
                    onClick={() => claimReward(challenge.id, "weekly")}
                    disabled={loading || !challenge.completed || challenge.claimed}
                  >
                    {challenge.claimed ? "Reivindicado" : challenge.completed ? "Reivindicar" : "Em progresso"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {weeklyChallenges.length === 0 && (
            <Card className="bg-gray-800 border-gray-700 col-span-full">
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum desafio semanal disponível</p>
                <p className="text-sm text-gray-500 mt-2">Novos desafios semanais serão gerados em breve!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "streak" && challengeStreak && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-400" />
                Sequência de Desafios
              </CardTitle>
              <p className="text-gray-300">Complete desafios consecutivamente para ganhar bônus especiais</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gray-800 rounded-lg">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">{challengeStreak.current_streak}</div>
                  <p className="text-gray-400">Sequência Atual</p>
                </div>
                <div className="text-center p-6 bg-gray-800 rounded-lg">
                  <div className="text-4xl font-bold text-orange-400 mb-2">{challengeStreak.longest_streak}</div>
                  <p className="text-gray-400">Melhor Sequência</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Recompensas de Sequência</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getStreakRewards().map((reward) => (
                    <Card
                      key={reward.level}
                      className={`bg-gray-700 border-gray-600 ${
                        challengeStreak.current_streak >= reward.level && !reward.claimed
                          ? "ring-2 ring-yellow-500/50"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-white mb-2">{reward.level}</div>
                        <p className="text-sm text-gray-400 mb-3">dias consecutivos</p>
                        <p className="text-white font-semibold mb-3">{reward.reward}</p>
                        <Button
                          onClick={() => claimStreakReward(reward.level)}
                          disabled={loading || challengeStreak.current_streak < reward.level || reward.claimed}
                          size="sm"
                          className="w-full"
                        >
                          {reward.claimed
                            ? "Reivindicado"
                            : challengeStreak.current_streak >= reward.level
                              ? "Reivindicar"
                              : "Bloqueado"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {challengeStreak.last_completion_date && (
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-400">Último desafio completado em:</p>
                  <p className="text-white font-semibold">
                    {new Date(challengeStreak.last_completion_date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
