"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
}

interface CardFlipAnimationProps {
  card: PokemonCard
  isFlipped: boolean
  onFlip: () => void
}

export function CardFlipAnimation({ card, isFlipped, onFlip }: CardFlipAnimationProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500"
      case "Uncommon":
        return "bg-green-500"
      case "Rare":
        return "bg-blue-500"
      case "Epic":
        return "bg-purple-500"
      case "Legendary":
        return "bg-yellow-500"
      case "Mythic":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "shadow-2xl shadow-yellow-400/50"
      case "Mythic":
        return "shadow-2xl shadow-red-400/50"
      case "Epic":
        return "shadow-xl shadow-purple-400/50"
      default:
        return ""
    }
  }

  return (
    <div className="relative w-48 h-64 cursor-pointer" onClick={onFlip}>
      <div
        className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <Card className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-white text-center">
                <div className="text-4xl mb-2">🎴</div>
                <div className="text-lg font-bold">PokéCard</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <Card className={`w-full h-full ${getRarityGlow(card.rarity)}`}>
            <CardContent className="p-4 h-full flex flex-col">
              <img
                src={card.image || "/placeholder.svg"}
                alt={card.name}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <h3 className="font-bold text-lg text-center">{card.name}</h3>
              <Badge className={`${getRarityColor(card.rarity)} text-white mb-2 mx-auto`}>{card.rarity}</Badge>
              <div className="text-sm text-gray-600 text-center flex-1 flex flex-col justify-center">
                <p>HP: {card.hp}</p>
                <p>ATK: {card.attack}</p>
                <p>DEF: {card.defense}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
