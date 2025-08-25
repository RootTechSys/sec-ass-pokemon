"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

interface PokemonCard {
  id: number
  name: string
  type: string
  rarity: string
  image: string
  hp: number
  attack: number
  defense: number
  price: number
  generation: number
  evolution_stage: string
}

interface BattleState {
  playerCard: PokemonCard | null
  opponentCard: PokemonCard | null
  playerHP: number
  opponentHP: number
  turn: "player" | "opponent"
  battleLog: string[]
  gameStatus: "selecting" | "battling" | "finished"
  winner: "player" | "opponent" | null
}

export default function BattleSystem() {
  const { user } = useAuth()
  const [userCards, setUserCards] = useState<PokemonCard[]>([])
  const [battleState, setBattleState] = useState<BattleState>({
    playerCard: null,
    opponentCard: null,
    playerHP: 0,
    opponentHP: 0,
    turn: "player",
    battleLog: [],
    gameStatus: "selecting",
    winner: null,
  })

  useEffect(() => {
    if (user) {
      fetchUserCards()
    }
  }, [user])

  const fetchUserCards = async () => {
    try {
      const response = await fetch(`/api/user/${user?.id}/cards`)
      const cards = await response.json()
      setUserCards(cards)
    } catch (error) {
      console.error("Erro ao carregar cartas:", error)
    }
  }

  const selectCard = async (card: PokemonCard) => {
    const opponentCard = await getRandomOpponentCard()

    setBattleState({
      playerCard: card,
      opponentCard,
      playerHP: card.hp,
      opponentHP: opponentCard.hp,
      turn: "player",
      battleLog: [`Batalha iniciada! ${card.name} vs ${opponentCard.name}`],
      gameStatus: "battling",
      winner: null,
    })
  }

  const getRandomOpponentCard = async (): Promise<PokemonCard> => {
    try {
      const response = await fetch("/api/cards")
      const cards = await response.json()
      const randomIndex = Math.floor(Math.random() * cards.length)
      return cards[randomIndex]
    } catch (error) {
      console.error("Erro ao buscar carta oponente:", error)
      return userCards[0]
    }
  }

  const calculateDamage = (attacker: PokemonCard, defender: PokemonCard): number => {
    const baseDamage = attacker.attack
    const defense = defender.defense
    const typeMultiplier = getTypeMultiplier(attacker.type, defender.type)
    const randomFactor = 0.85 + Math.random() * 0.3

    const damage = Math.max(1, Math.floor((baseDamage - defense * 0.5) * typeMultiplier * randomFactor))
    return damage
  }

  const getTypeMultiplier = (attackerType: string, defenderType: string): number => {
    const effectiveness: { [key: string]: { [key: string]: number } } = {
      Fire: { Grass: 2, Water: 0.5, Fire: 0.5, Ice: 2, Bug: 2, Steel: 2 },
      Water: { Fire: 2, Grass: 0.5, Water: 0.5, Ground: 2, Rock: 2 },
      Grass: { Water: 2, Fire: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Flying: 0.5, Bug: 0.5, Poison: 0.5, Steel: 0.5 },
      Electric: { Water: 2, Flying: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Dragon: 0.5 },
      Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
      Ice: { Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Fire: 0.5, Water: 0.5, Ice: 0.5, Steel: 0.5 },
      Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
      Dark: { Psychic: 2, Ghost: 2, Fighting: 0.5, Dark: 0.5, Fairy: 0.5 },
      Fighting: {
        Normal: 2,
        Ice: 2,
        Rock: 2,
        Dark: 2,
        Steel: 2,
        Flying: 0.5,
        Poison: 0.5,
        Bug: 0.5,
        Psychic: 0.5,
        Fairy: 0.5,
        Ghost: 0,
      },
      Poison: { Grass: 2, Fairy: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0 },
      Ground: { Fire: 2, Electric: 2, Poison: 2, Rock: 2, Steel: 2, Grass: 0.5, Bug: 0.5, Flying: 0 },
      Flying: { Electric: 0.5, Ice: 0.5, Rock: 0.5, Fighting: 2, Bug: 2, Grass: 2 },
      Bug: {
        Grass: 2,
        Psychic: 2,
        Dark: 2,
        Fire: 0.5,
        Fighting: 0.5,
        Poison: 0.5,
        Flying: 0.5,
        Ghost: 0.5,
        Steel: 0.5,
        Fairy: 0.5,
      },
      Rock: { Fire: 2, Ice: 2, Flying: 2, Bug: 2, Fighting: 0.5, Ground: 0.5, Steel: 0.5 },
      Ghost: { Psychic: 2, Ghost: 2, Dark: 0.5, Normal: 0 },
      Steel: { Ice: 2, Rock: 2, Fairy: 2, Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5 },
      Fairy: { Fighting: 2, Dragon: 2, Dark: 2, Fire: 0.5, Poison: 0.5, Steel: 0.5 },
    }

    return effectiveness[attackerType]?.[defenderType] || 1
  }

  const playerAttack = () => {
    if (battleState.gameStatus !== "battling" || battleState.turn !== "player") return

    const damage = calculateDamage(battleState.playerCard!, battleState.opponentCard!)
    const newOpponentHP = Math.max(0, battleState.opponentHP - damage)

    const effectiveness = getTypeMultiplier(battleState.playerCard!.type, battleState.opponentCard!.type)
    let effectivenessText = ""
    if (effectiveness > 1) effectivenessText = " É super efetivo!"
    else if (effectiveness < 1) effectivenessText = " Não é muito efetivo..."

    const newLog = [
      ...battleState.battleLog,
      `${battleState.playerCard!.name} atacou causando ${damage} de dano!${effectivenessText}`,
    ]

    if (newOpponentHP <= 0) {
      setBattleState((prev) => ({
        ...prev,
        opponentHP: 0,
        battleLog: [...newLog, `${battleState.opponentCard!.name} foi derrotado! Você venceu!`],
        gameStatus: "finished",
        winner: "player",
      }))
      rewardPlayer()
    } else {
      setBattleState((prev) => ({
        ...prev,
        opponentHP: newOpponentHP,
        turn: "opponent",
        battleLog: newLog,
      }))

      setTimeout(opponentAttack, 1500)
    }
  }

  const opponentAttack = () => {
    const damage = calculateDamage(battleState.opponentCard!, battleState.playerCard!)
    const newPlayerHP = Math.max(0, battleState.playerHP - damage)

    const effectiveness = getTypeMultiplier(battleState.opponentCard!.type, battleState.playerCard!.type)
    let effectivenessText = ""
    if (effectiveness > 1) effectivenessText = " É super efetivo!"
    else if (effectiveness < 1) effectivenessText = " Não é muito efetivo..."

    const newLog = [
      ...battleState.battleLog,
      `${battleState.opponentCard!.name} atacou causando ${damage} de dano!${effectivenessText}`,
    ]

    if (newPlayerHP <= 0) {
      setBattleState((prev) => ({
        ...prev,
        playerHP: 0,
        battleLog: [...newLog, `${battleState.playerCard!.name} foi derrotado! Você perdeu!`],
        gameStatus: "finished",
        winner: "opponent",
      }))
    } else {
      setBattleState((prev) => ({
        ...prev,
        playerHP: newPlayerHP,
        turn: "player",
        battleLog: newLog,
      }))
    }
  }

  const rewardPlayer = async () => {
    try {
      await fetch("/api/battle/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, coins: 50 }),
      })
    } catch (error) {
      console.error("Erro ao dar recompensa:", error)
    }
  }

  const resetBattle = () => {
    setBattleState({
      playerCard: null,
      opponentCard: null,
      playerHP: 0,
      opponentHP: 0,
      turn: "player",
      battleLog: [],
      gameStatus: "selecting",
      winner: null,
    })
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Fire: "bg-red-500",
      Water: "bg-blue-500",
      Grass: "bg-green-500",
      Electric: "bg-yellow-500",
      Psychic: "bg-purple-500",
      Ice: "bg-cyan-500",
      Dragon: "bg-indigo-600",
      Dark: "bg-gray-800",
      Fighting: "bg-orange-600",
      Poison: "bg-purple-600",
      Ground: "bg-yellow-600",
      Flying: "bg-blue-300",
      Bug: "bg-green-600",
      Rock: "bg-yellow-800",
      Ghost: "bg-purple-800",
      Steel: "bg-gray-500",
      Fairy: "bg-pink-500",
      Normal: "bg-gray-400",
    }
    return colors[type] || "bg-gray-400"
  }

  if (!user) {
    return <div className="p-4 sm:p-8 text-center text-sm sm:text-base">Faça login para batalhar!</div>
  }

  return (
    <div className="container mx-auto p-3 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Arena de Batalha Pokémon</h1>

      {battleState.gameStatus === "selecting" && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Escolha seu Pokémon para a batalha:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {userCards.map((card) => (
              <Card
                key={card.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => selectCard(card)}
              >
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xs sm:text-sm truncate">{card.name}</CardTitle>
                    <Badge className={`${getTypeColor(card.type)} text-white text-xs`}>{card.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <img
                    src={card.image || "/placeholder.svg"}
                    alt={card.name}
                    className="w-full h-24 sm:h-32 object-cover rounded mb-2"
                  />
                  <div className="text-xs space-y-1">
                    <div>HP: {card.hp}</div>
                    <div>ATK: {card.attack}</div>
                    <div>DEF: {card.defense}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {battleState.gameStatus === "battling" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-sm sm:text-base">{battleState.playerCard?.name}</span>
                  <Badge className={`${getTypeColor(battleState.playerCard?.type || "")} text-white text-xs`}>
                    {battleState.playerCard?.type}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <img
                  src={battleState.playerCard?.image || "/placeholder.svg"}
                  alt={battleState.playerCard?.name}
                  className="w-full h-32 sm:h-48 object-cover rounded mb-4"
                />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>HP:</span>
                    <span>
                      {battleState.playerHP}/{battleState.playerCard?.hp}
                    </span>
                  </div>
                  <Progress value={(battleState.playerHP / (battleState.playerCard?.hp || 1)) * 100} className="h-2" />
                  <div className="text-xs sm:text-sm text-gray-600">
                    ATK: {battleState.playerCard?.attack} | DEF: {battleState.playerCard?.defense}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-sm sm:text-base">{battleState.opponentCard?.name}</span>
                  <Badge className={`${getTypeColor(battleState.opponentCard?.type || "")} text-white text-xs`}>
                    {battleState.opponentCard?.type}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <img
                  src={battleState.opponentCard?.image || "/placeholder.svg"}
                  alt={battleState.opponentCard?.name}
                  className="w-full h-32 sm:h-48 object-cover rounded mb-4"
                />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>HP:</span>
                    <span>
                      {battleState.opponentHP}/{battleState.opponentCard?.hp}
                    </span>
                  </div>
                  <Progress
                    value={(battleState.opponentHP / (battleState.opponentCard?.hp || 1)) * 100}
                    className="h-2"
                  />
                  <div className="text-xs sm:text-sm text-gray-600">
                    ATK: {battleState.opponentCard?.attack} | DEF: {battleState.opponentCard?.defense}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              onClick={playerAttack}
              disabled={battleState.turn !== "player"}
              size="lg"
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {battleState.turn === "player" ? "Atacar!" : "Turno do Oponente..."}
            </Button>
          </div>

          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base">Log da Batalha</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="h-24 sm:h-32 overflow-y-auto space-y-1">
                {battleState.battleLog.map((log, index) => (
                  <div key={index} className="text-xs sm:text-sm">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {battleState.gameStatus === "finished" && (
        <div className="text-center space-y-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="p-4">
              <CardTitle
                className={`text-lg sm:text-xl ${battleState.winner === "player" ? "text-green-600" : "text-red-600"}`}
              >
                {battleState.winner === "player" ? "Vitória!" : "Derrota!"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="mb-4 text-sm sm:text-base">
                {battleState.winner === "player"
                  ? "Parabéns! Você ganhou 50 moedas!"
                  : "Não desista! Tente novamente com outro Pokémon!"}
              </p>
              <Button onClick={resetBattle} className="w-full">
                Nova Batalha
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
