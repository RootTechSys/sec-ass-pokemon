"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  requirement: number
  currentProgress: number
  completed: boolean
  reward: number
  category: "collection" | "battle" | "trade" | "pack"
}

const achievementTemplates = [
  {
    id: 1,
    name: "Primeiro Passo",
    description: "Compre seu primeiro pacote de cartas",
    icon: "📦",
    requirement: 1,
    reward: 25,
    category: "pack" as const,
  },
  {
    id: 2,
    name: "Colecionador Iniciante",
    description: "Colete 10 cartas diferentes",
    icon: "🎴",
    requirement: 10,
    reward: 50,
    category: "collection" as const,
  },
  {
    id: 3,
    name: "Colecionador Experiente",
    description: "Colete 25 cartas diferentes",
    icon: "🏆",
    requirement: 25,
    reward: 100,
    category: "collection" as const,
  },
  {
    id: 4,
    name: "Mestre Colecionador",
    description: "Colete 50 cartas diferentes",
    icon: "👑",
    requirement: 50,
    reward: 200,
    category: "collection" as const,
  },
  {
    id: 5,
    name: "Primeira Vitória",
    description: "Vença sua primeira batalha",
    icon: "⚔️",
    requirement: 1,
    reward: 30,
    category: "battle" as const,
  },
  {
    id: 6,
    name: "Guerreiro",
    description: "Vença 5 batalhas",
    icon: "🛡️",
    requirement: 5,
    reward: 75,
    category: "battle" as const,
  },
  {
    id: 7,
    name: "Campeão",
    description: "Vença 15 batalhas",
    icon: "🥇",
    requirement: 15,
    reward: 150,
    category: "battle" as const,
  },
  {
    id: 8,
    name: "Lenda",
    description: "Vença 30 batalhas",
    icon: "⭐",
    requirement: 30,
    reward: 300,
    category: "battle" as const,
  },
  {
    id: 9,
    name: "Negociador",
    description: "Complete sua primeira troca",
    icon: "🤝",
    requirement: 1,
    reward: 40,
    category: "trade" as const,
  },
  {
    id: 10,
    name: "Comerciante",
    description: "Complete 5 trocas",
    icon: "💼",
    requirement: 5,
    reward: 80,
    category: "trade" as const,
  },
  {
    id: 11,
    name: "Viciado em Pacotes",
    description: "Abra 10 pacotes",
    icon: "🎁",
    requirement: 10,
    reward: 60,
    category: "pack" as const,
  },
  {
    id: 12,
    name: "Caçador de Lendários",
    description: "Colete 3 cartas lendárias",
    icon: "🌟",
    requirement: 3,
    reward: 120,
    category: "collection" as const,
  },
  {
    id: 13,
    name: "Sortudo",
    description: "Abra 25 pacotes",
    icon: "🍀",
    requirement: 25,
    reward: 100,
    category: "pack" as const,
  },
  {
    id: 14,
    name: "Mestre Trader",
    description: "Complete 15 trocas",
    icon: "💎",
    requirement: 15,
    reward: 180,
    category: "trade" as const,
  },
  {
    id: 15,
    name: "Invencível",
    description: "Vença 50 batalhas",
    icon: "🔥",
    requirement: 50,
    reward: 500,
    category: "battle" as const,
  },
]

export default function AchievementSystem() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState({
    totalCards: 0,
    uniqueCards: 0,
    battlesWon: 0,
    tradesCompleted: 0,
    packsOpened: 0,
    legendaryCards: 0,
  })

  useEffect(() => {
    if (user) {
      loadAchievements()
      loadUserStats()
    }
  }, [user])

  const loadAchievements = async () => {
    try {
      const response = await fetch(`/api/user/${user?.id}/achievements`)
      if (response.ok) {
        const userAchievements = await response.json()
        const achievementsWithProgress = achievementTemplates.map((template) => {
          const userAchievement = userAchievements.find((ua: any) => ua.achievement_id === template.id)
          return {
            ...template,
            currentProgress: userAchievement?.progress || 0,
            completed: userAchievement?.completed || false,
          }
        })
        setAchievements(achievementsWithProgress)
      } else {
        setAchievements(
          achievementTemplates.map((template) => ({
            ...template,
            currentProgress: 0,
            completed: false,
          })),
        )
      }
    } catch (error) {
      console.error("Erro ao carregar conquistas:", error)
      setAchievements(
        achievementTemplates.map((template) => ({
          ...template,
          currentProgress: 0,
          completed: false,
        })),
      )
    }
  }

  const loadUserStats = async () => {
    try {
      const response = await fetch(`/api/user/${user?.id}/stats`)
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
        updateAchievementProgress(stats)
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const updateAchievementProgress = (stats: any) => {
    setAchievements((prev) =>
      prev.map((achievement) => {
        let currentProgress = 0

        switch (achievement.category) {
          case "collection":
            if (achievement.name.includes("lendárias")) {
              currentProgress = stats.legendaryCards || 0
            } else {
              currentProgress = stats.uniqueCards || 0
            }
            break
          case "battle":
            currentProgress = stats.battlesWon || 0
            break
          case "trade":
            currentProgress = stats.tradesCompleted || 0
            break
          case "pack":
            currentProgress = stats.packsOpened || 0
            break
        }

        const completed = currentProgress >= achievement.requirement

        if (completed && !achievement.completed) {
          claimAchievement(achievement.id)
        }

        return {
          ...achievement,
          currentProgress: Math.min(currentProgress, achievement.requirement),
          completed,
        }
      }),
    )
  }

  const claimAchievement = async (achievementId: number) => {
    try {
      await fetch("/api/achievements/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, achievementId }),
      })
    } catch (error) {
      console.error("Erro ao reivindicar conquista:", error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "collection":
        return "bg-blue-500"
      case "battle":
        return "bg-red-500"
      case "trade":
        return "bg-green-500"
      case "pack":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "collection":
        return "Coleção"
      case "battle":
        return "Batalha"
      case "trade":
        return "Troca"
      case "pack":
        return "Pacotes"
      default:
        return "Geral"
    }
  }

  const completedAchievements = achievements.filter((a) => a.completed).length
  const totalRewards = achievements.filter((a) => a.completed).reduce((sum, a) => sum + a.reward, 0)

  if (!user) {
    return <div className="p-8 text-center">Faça login para ver suas conquistas!</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sistema de Conquistas</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>
            Conquistas Completas: {completedAchievements}/{achievements.length}
          </span>
          <span>Recompensas Ganhas: {totalRewards} moedas</span>
        </div>
        <Progress value={(completedAchievements / achievements.length) * 100} className="mt-2" />
      </div>

      <div className="grid gap-4">
        {["collection", "battle", "trade", "pack"].map((category) => {
          const categoryAchievements = achievements.filter((a) => a.category === category)
          const completedInCategory = categoryAchievements.filter((a) => a.completed).length

          return (
            <Card key={category} className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={`${getCategoryColor(category)} text-white`}>{getCategoryName(category)}</Badge>
                    <span>
                      {completedInCategory}/{categoryAchievements.length}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryAchievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`transition-all ${
                        achievement.completed ? "bg-green-50 border-green-200 shadow-md" : "hover:shadow-md"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{achievement.icon}</span>
                            <CardTitle className="text-sm">{achievement.name}</CardTitle>
                          </div>
                          {achievement.completed && (
                            <Badge variant="default" className="bg-green-500">
                              Completa
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-3">{achievement.description}</CardDescription>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso:</span>
                            <span>
                              {achievement.currentProgress}/{achievement.requirement}
                            </span>
                          </div>
                          <Progress
                            value={(achievement.currentProgress / achievement.requirement) * 100}
                            className="h-2"
                          />

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-yellow-600 font-medium">Recompensa: {achievement.reward} moedas</span>
                            {achievement.completed && (
                              <span className="text-green-600 font-medium">✓ Reivindicada</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
