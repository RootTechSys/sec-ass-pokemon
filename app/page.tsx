"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { PackOpeningAnimation } from "@/components/pack-opening-animation"
import { TradingSystem } from "@/components/trading-system"
import { AuthForms } from "@/components/auth-forms"
import { useAuth } from "@/hooks/use-auth"
import BattleSystem from "@/components/battle-system"
import AchievementSystem from "@/components/achievement-system"
import NotificationSystem from "@/components/notification-system"
import LeaderboardSystem from "@/components/leaderboard-system"

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

const mockCards: PokemonCard[] = [
  {
    id: 1,
    name: "Pikachu",
    type: "Electric",
    rarity: "Common",
    image: "/pikachu-pokemon-card.png",
    hp: 60,
    attack: 55,
    defense: 40,
    price: 10,
  },
  {
    id: 2,
    name: "Charizard",
    type: "Fire",
    rarity: "Rare",
    image: "/charizard-pokemon-card.png",
    hp: 120,
    attack: 130,
    defense: 100,
    price: 50,
  },
  {
    id: 3,
    name: "Blastoise",
    type: "Water",
    rarity: "Rare",
    image: "/blastoise-pokemon-card.png",
    hp: 110,
    attack: 110,
    defense: 120,
    price: 45,
  },
  {
    id: 4,
    name: "Venusaur",
    type: "Grass",
    rarity: "Rare",
    image: "/venusaur-pokemon-card.png",
    hp: 100,
    attack: 100,
    defense: 120,
    price: 45,
  },
  {
    id: 5,
    name: "Mewtwo",
    type: "Psychic",
    rarity: "Legendary",
    image: "/mewtwo-pokemon-card.png",
    hp: 130,
    attack: 150,
    defense: 90,
    price: 100,
  },
  {
    id: 6,
    name: "Mew",
    type: "Psychic",
    rarity: "Legendary",
    image: "/mew-pokemon-card.png",
    hp: 100,
    attack: 100,
    defense: 100,
    price: 80,
  },
]

export default function PokemonCardApp() {
  const { user, login, logout, isLoading } = useAuth()
  const [userCards, setUserCards] = useState<PokemonCard[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpeningPack, setIsOpeningPack] = useState(false)
  const [openedCards, setOpenedCards] = useState<PokemonCard[]>([])
  const [packType, setPackType] = useState<"basic" | "premium">("basic")

  useEffect(() => {
    if (user) {
      loadUserCards()
    }
  }, [user])

  const loadUserCards = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/${user.id}/cards`)
      if (response.ok) {
        const cards = await response.json()
        setUserCards(cards)
      }
    } catch (error) {
      console.error("Error loading user cards:", error)
      setUserCards([mockCards[0], mockCards[1]])
    }
  }

  const buyPack = async (type: "basic" | "premium" = "basic") => {
    const cost = type === "premium" ? 150 : 50

    if (!user || user.coins < cost) {
      toast({
        title: "Moedas insuficientes!",
        description: `Você precisa de ${cost} moedas para comprar este pacote.`,
      })
      return
    }

    try {
      const response = await fetch(`/api/packs/${type === "premium" ? "premium" : "buy"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Erro ao comprar pacote")
      }

      const data = await response.json()

      setOpenedCards(data.cards)
      setPackType(type)
      setIsOpeningPack(true)

      login({ ...user, coins: data.newBalance })
    } catch (error) {
      console.error("Pack purchase error:", error)

      const randomCards = []
      for (let i = 0; i < (type === "premium" ? 5 : 3); i++) {
        const randomCard = mockCards[Math.floor(Math.random() * mockCards.length)]
        randomCards.push({ ...randomCard, id: Date.now() + i })
      }

      setOpenedCards(randomCards)
      setPackType(type)
      setIsOpeningPack(true)
      login({ ...user, coins: user.coins - cost })
    }
  }

  const handlePackOpeningComplete = () => {
    setIsOpeningPack(false)
    setUserCards([...userCards, ...openedCards])
    toast({
      title: "Pacote aberto!",
      description: `Você recebeu ${openedCards.length} novas cartas!`,
    })
    setOpenedCards([])
  }

  const searchCards = () => {
    const query = `SELECT * FROM cards WHERE name LIKE '%${searchQuery}%'`
    console.log("Executing query:", query)

    const filteredCards = mockCards.filter((card) => card.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return filteredCards
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "bg-gray-500"
      case "Rare":
        return "bg-blue-500"
      case "Legendary":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredCards = searchQuery ? searchCards() : mockCards

  const handleTradeComplete = () => {
    toast({ title: "Troca realizada!", description: "Suas cartas foram atualizadas." })
    loadUserCards()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForms onLoginSuccess={login} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {isOpeningPack && (
        <PackOpeningAnimation cards={openedCards} onComplete={handlePackOpeningComplete} packType={packType} />
      )}

      <div className="container mx-auto p-2 sm:p-4">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 bg-white/10 backdrop-blur-md rounded-lg p-3 sm:p-4 gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-4xl font-bold text-white">PokéCards</h1>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full">
              <span className="text-lg sm:text-xl">🪙</span>
              <span className="font-bold text-sm sm:text-base">{user.coins}</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationSystem />
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs sm:text-sm">{user.username[0]}</AvatarFallback>
              </Avatar>
              <span className="text-white font-semibold text-sm sm:text-base hidden sm:inline">{user.username}</span>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-white border-white hover:bg-white/20 bg-transparent text-xs sm:text-sm"
              >
                Sair
              </Button>
            </div>
          </div>
        </header>

        <Tabs defaultValue="shop" className="w-full">
          <div className="overflow-x-auto mb-4 sm:mb-6">
            <TabsList className="grid grid-cols-7 w-full min-w-max sm:min-w-0">
              <TabsTrigger value="shop" className="text-xs sm:text-sm px-2 sm:px-4">
                Loja
              </TabsTrigger>
              <TabsTrigger value="collection" className="text-xs sm:text-sm px-2 sm:px-4">
                Coleção
              </TabsTrigger>
              <TabsTrigger value="battle" className="text-xs sm:text-sm px-2 sm:px-4">
                Batalha
              </TabsTrigger>
              <TabsTrigger value="trade" className="text-xs sm:text-sm px-2 sm:px-4">
                Trocas
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-xs sm:text-sm px-2 sm:px-4">
                Conquistas
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-xs sm:text-sm px-2 sm:px-4">
                Rankings
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs sm:text-sm px-2 sm:px-4">
                Buscar
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="shop">
            <div className="grid gap-4 sm:gap-6">
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl">Pacotes de Cartas</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Compre pacotes para expandir sua coleção!
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border-2 border-yellow-400">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg sm:text-xl">Pacote Básico</CardTitle>
                        <CardDescription className="text-sm">3 cartas aleatórias</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                          <span className="text-xl sm:text-2xl font-bold">50 🪙</span>
                          <Button
                            onClick={() => buyPack("basic")}
                            className="bg-yellow-500 hover:bg-yellow-600 w-full sm:w-auto"
                            disabled={isOpeningPack}
                          >
                            Comprar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-400">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg sm:text-xl">Pacote Premium</CardTitle>
                        <CardDescription className="text-sm">5 cartas com maior chance de raras</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                          <span className="text-xl sm:text-2xl font-bold">150 🪙</span>
                          <Button
                            onClick={() => buyPack("premium")}
                            className="bg-purple-500 hover:bg-purple-600 w-full sm:w-auto"
                            disabled={isOpeningPack}
                          >
                            Comprar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Cartas Disponíveis</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {mockCards.map((card) => (
                      <Card key={card.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                          <img
                            src={card.image || "/placeholder.svg"}
                            alt={card.name}
                            className="w-full h-32 sm:h-48 object-cover rounded-lg mb-2"
                          />
                          <h3 className="font-bold text-sm sm:text-lg truncate">{card.name}</h3>
                          <Badge className={`${getRarityColor(card.rarity)} text-white mb-2 text-xs`}>
                            {card.rarity}
                          </Badge>
                          <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                            <p>HP: {card.hp}</p>
                            <p>ATK: {card.attack}</p>
                            <p>DEF: {card.defense}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collection">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Minha Coleção ({userCards.length} cartas)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {userCards.length === 0 ? (
                  <p className="text-center text-gray-500 py-8 text-sm sm:text-base">
                    Você ainda não possui cartas. Compre um pacote para começar!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {userCards.map((card, index) => (
                      <Card key={`${card.id}-${index}`} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-3 sm:p-4">
                          <img
                            src={card.image || "/placeholder.svg"}
                            alt={card.name}
                            className="w-full h-32 sm:h-48 object-cover rounded-lg mb-2"
                          />
                          <h3 className="font-bold text-sm sm:text-lg truncate">{card.name}</h3>
                          <Badge className={`${getRarityColor(card.rarity)} text-white mb-2 text-xs`}>
                            {card.rarity}
                          </Badge>
                          <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                            <p>HP: {card.hp}</p>
                            <p>ATK: {card.attack}</p>
                            <p>DEF: {card.defense}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="battle">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-0">
                <BattleSystem />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-0">
                <AchievementSystem />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trade">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Sistema de Trocas</CardTitle>
                <CardDescription className="text-sm sm:text-base">Troque cartas com outros jogadores</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <TradingSystem currentUser={user} userCards={userCards} onTradeComplete={handleTradeComplete} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-0">
                <LeaderboardSystem userId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Buscar Cartas</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="mb-4">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite o nome da carta..."
                    className="mb-2 text-sm sm:text-base"
                  />
                  <Button onClick={() => setSearchQuery(searchQuery)} className="w-full sm:w-auto">
                    Buscar
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filteredCards.map((card) => (
                    <Card key={card.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-3 sm:p-4">
                        <img
                          src={card.image || "/placeholder.svg"}
                          alt={card.name}
                          className="w-full h-32 sm:h-48 object-cover rounded-lg mb-2"
                        />
                        <h3 className="font-bold text-sm sm:text-lg truncate">{card.name}</h3>
                        <Badge className={`${getRarityColor(card.rarity)} text-white mb-2 text-xs`}>
                          {card.rarity}
                        </Badge>
                        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                          <p>HP: {card.hp}</p>
                          <p>ATK: {card.attack}</p>
                          <p>DEF: {card.defense}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
