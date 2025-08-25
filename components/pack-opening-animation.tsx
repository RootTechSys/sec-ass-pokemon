"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

interface PackOpeningAnimationProps {
  cards: PokemonCard[]
  onComplete: () => void
  packType: "basic" | "premium"
}

export function PackOpeningAnimation({ cards, onComplete, packType }: PackOpeningAnimationProps) {
  const [currentStep, setCurrentStep] = useState<"opening" | "revealing" | "complete">("opening")
  const [revealedCards, setRevealedCards] = useState<PokemonCard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  useEffect(() => {
    const openingTimer = setTimeout(() => {
      setCurrentStep("revealing")
    }, 2000)

    return () => clearTimeout(openingTimer)
  }, [])

  useEffect(() => {
    if (currentStep === "revealing" && currentCardIndex < cards.length) {
      const revealTimer = setTimeout(() => {
        setRevealedCards((prev) => [...prev, cards[currentCardIndex]])
        setCurrentCardIndex((prev) => prev + 1)
      }, 800)

      return () => clearTimeout(revealTimer)
    } else if (currentStep === "revealing" && currentCardIndex >= cards.length) {
      const completeTimer = setTimeout(() => {
        setCurrentStep("complete")
      }, 1000)

      return () => clearTimeout(completeTimer)
    }
  }, [currentStep, currentCardIndex, cards])

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

  if (currentStep === "opening") {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-48 h-64 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-2xl animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-pink-400/20 rounded-lg animate-ping"></div>
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-xl font-bold">{packType === "premium" ? "PREMIUM" : "BASIC"}</div>
              </div>
            </div>
          </div>
          <p className="text-white text-xl mt-4 animate-bounce">Abrindo pacote...</p>
        </div>
      </div>
    )
  }

  if (currentStep === "revealing") {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {cards.map((card, index) => (
              <div key={card.id} className="relative">
                {index < revealedCards.length ? (
                  <Card
                    className={`w-48 h-64 transform transition-all duration-1000 ${getRarityGlow(card.rarity)} animate-in slide-in-from-bottom-4 fade-in`}
                  >
                    <CardContent className="p-4 h-full flex flex-col">
                      <img
                        src={card.image || "/placeholder.svg"}
                        alt={card.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <h3 className="font-bold text-lg text-center">{card.name}</h3>
                      <Badge className={`${getRarityColor(card.rarity)} text-white mb-2 mx-auto`}>{card.rarity}</Badge>
                      <div className="text-sm text-gray-600 text-center">
                        <p>HP: {card.hp}</p>
                        <p>ATK: {card.attack}</p>
                        <p>DEF: {card.defense}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="w-48 h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-lg animate-pulse">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-white text-lg">?</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-white text-xl">
            Revelando cartas... ({revealedCards.length}/{cards.length})
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-white mb-6">Parabéns! Suas novas cartas:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {cards.map((card) => (
            <Card key={card.id} className={`w-48 h-64 mx-auto ${getRarityGlow(card.rarity)}`}>
              <CardContent className="p-4 h-full flex flex-col">
                <img
                  src={card.image || "/placeholder.svg"}
                  alt={card.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold text-lg text-center">{card.name}</h3>
                <Badge className={`${getRarityColor(card.rarity)} text-white mb-2 mx-auto`}>{card.rarity}</Badge>
                <div className="text-sm text-gray-600 text-center">
                  <p>HP: {card.hp}</p>
                  <p>ATK: {card.attack}</p>
                  <p>DEF: {card.defense}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
          Continuar
        </Button>
      </div>
    </div>
  )
}
