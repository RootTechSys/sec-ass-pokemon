"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  quantity?: number
}

interface User {
  id: number
  username: string
  avatar: string
  coins: number
}

interface TradeOffer {
  id: number
  from_user_id: number
  to_user_id: number
  from_username: string
  to_username: string
  offered_card_id: number
  requested_card_id: number
  offered_card_name: string
  requested_card_name: string
  message: string
  status: "pending" | "accepted" | "rejected" | "cancelled"
  created_at: string
}

interface TradingSystemProps {
  currentUser: User
  userCards: PokemonCard[]
  onTradeComplete: () => void
}

export function TradingSystem({ currentUser, userCards, onTradeComplete }: TradingSystemProps) {
  const [searchUserId, setSearchUserId] = useState("")
  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [targetUserCards, setTargetUserCards] = useState<PokemonCard[]>([])
  const [selectedMyCard, setSelectedMyCard] = useState<PokemonCard | null>(null)
  const [selectedTargetCard, setSelectedTargetCard] = useState<PokemonCard | null>(null)
  const [tradeMessage, setTradeMessage] = useState("")
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTradeOffers()
  }, [])

  const fetchTradeOffers = async () => {
    try {
      const response = await fetch("/api/trades")
      if (response.ok) {
        const offers = await response.json()
        setTradeOffers(offers)
      }
    } catch (error) {
      console.error("Error fetching trade offers:", error)
    }
  }

  const searchUser = async () => {
    if (!searchUserId.trim()) return

    setLoading(true)
    try {
      const userResponse = await fetch(`/api/user/${searchUserId}`)
      if (!userResponse.ok) {
        toast({ title: "Erro", description: "Usuário não encontrado" })
        return
      }

      const user = await userResponse.json()
      setTargetUser(user)

      const cardsResponse = await fetch(`/api/user/${searchUserId}/cards`)
      if (cardsResponse.ok) {
        const cards = await cardsResponse.json()
        setTargetUserCards(cards)
      }
    } catch (error) {
      console.error("Error searching user:", error)
      toast({ title: "Erro", description: "Erro ao buscar usuário" })
    } finally {
      setLoading(false)
    }
  }

  const createTradeOffer = async () => {
    if (!selectedMyCard || !selectedTargetCard || !targetUser) {
      toast({ title: "Erro", description: "Selecione as cartas para a troca" })
      return
    }

    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: targetUser.id,
          offeredCardId: selectedMyCard.id,
          requestedCardId: selectedTargetCard.id,
          message: tradeMessage,
        }),
      })

      if (response.ok) {
        toast({ title: "Sucesso", description: "Proposta de troca enviada!" })
        setSelectedMyCard(null)
        setSelectedTargetCard(null)
        setTradeMessage("")
        fetchTradeOffers()
      } else {
        toast({ title: "Erro", description: "Erro ao criar proposta de troca" })
      }
    } catch (error) {
      console.error("Error creating trade offer:", error)
      toast({ title: "Erro", description: "Erro ao criar proposta de troca" })
    }
  }

  const acceptTrade = async (tradeId: number) => {
    try {
      const response = await fetch(`/api/trades/${tradeId}/accept`, {
        method: "POST",
      })

      if (response.ok) {
        toast({ title: "Sucesso", description: "Troca aceita!" })
        fetchTradeOffers()
        onTradeComplete()
      } else {
        toast({ title: "Erro", description: "Erro ao aceitar troca" })
      }
    } catch (error) {
      console.error("Error accepting trade:", error)
      toast({ title: "Erro", description: "Erro ao aceitar troca" })
    }
  }

  const rejectTrade = async (tradeId: number) => {
    try {
      const response = await fetch(`/api/trades/${tradeId}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        toast({ title: "Troca rejeitada", description: "Proposta de troca rejeitada" })
        fetchTradeOffers()
      } else {
        toast({ title: "Erro", description: "Erro ao rejeitar troca" })
      }
    } catch (error) {
      console.error("Error rejecting trade:", error)
      toast({ title: "Erro", description: "Erro ao rejeitar troca" })
    }
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "accepted":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const incomingTrades = tradeOffers.filter(
    (offer) => offer.to_user_id === currentUser.id && offer.status === "pending",
  )
  const outgoingTrades = tradeOffers.filter((offer) => offer.from_user_id === currentUser.id)
  const completedTrades = tradeOffers.filter((offer) => offer.status !== "pending")

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Criar Troca</TabsTrigger>
          <TabsTrigger value="incoming">
            Recebidas {incomingTrades.length > 0 && `(${incomingTrades.length})`}
          </TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Usuário</CardTitle>
              <CardDescription>Digite o ID do usuário para ver sua coleção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  placeholder="ID do usuário (ex: 2)"
                  className="flex-1"
                />
                <Button onClick={searchUser} disabled={loading}>
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {targetUser && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
                    </Avatar>
                    Suas Cartas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {userCards.map((card, index) => (
                      <Card
                        key={`my-${card.id}-${index}`}
                        className={`cursor-pointer transition-all ${
                          selectedMyCard?.id === card.id ? "ring-2 ring-blue-500" : "hover:shadow-md"
                        }`}
                        onClick={() => setSelectedMyCard(card)}
                      >
                        <CardContent className="p-2">
                          <img
                            src={card.image || "/placeholder.svg"}
                            alt={card.name}
                            className="w-full h-20 object-cover rounded mb-1"
                          />
                          <p className="text-xs font-semibold truncate">{card.name}</p>
                          <Badge className={`${getRarityColor(card.rarity)} text-white text-xs`} size="sm">
                            {card.rarity}
                          </Badge>
                          {card.quantity && card.quantity > 1 && (
                            <span className="text-xs text-gray-500">x{card.quantity}</span>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={targetUser.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{targetUser.username[0]}</AvatarFallback>
                    </Avatar>
                    Cartas de {targetUser.username}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {targetUserCards.map((card, index) => (
                      <Card
                        key={`target-${card.id}-${index}`}
                        className={`cursor-pointer transition-all ${
                          selectedTargetCard?.id === card.id ? "ring-2 ring-green-500" : "hover:shadow-md"
                        }`}
                        onClick={() => setSelectedTargetCard(card)}
                      >
                        <CardContent className="p-2">
                          <img
                            src={card.image || "/placeholder.svg"}
                            alt={card.name}
                            className="w-full h-20 object-cover rounded mb-1"
                          />
                          <p className="text-xs font-semibold truncate">{card.name}</p>
                          <Badge className={`${getRarityColor(card.rarity)} text-white text-xs`} size="sm">
                            {card.rarity}
                          </Badge>
                          {card.quantity && card.quantity > 1 && (
                            <span className="text-xs text-gray-500">x{card.quantity}</span>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedMyCard && selectedTargetCard && (
            <Card>
              <CardHeader>
                <CardTitle>Finalizar Troca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="font-semibold mb-2">Você oferece:</p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-bold">{selectedMyCard.name}</p>
                      <Badge className={`${getRarityColor(selectedMyCard.rarity)} text-white`}>
                        {selectedMyCard.rarity}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold mb-2">Você recebe:</p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-bold">{selectedTargetCard.name}</p>
                      <Badge className={`${getRarityColor(selectedTargetCard.rarity)} text-white`}>
                        {selectedTargetCard.rarity}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mensagem (opcional):</label>
                  <Textarea
                    value={tradeMessage}
                    onChange={(e) => setTradeMessage(e.target.value)}
                    placeholder="Digite uma mensagem para acompanhar sua proposta..."
                    rows={3}
                  />
                </div>

                <Button onClick={createTradeOffer} className="w-full bg-green-600 hover:bg-green-700">
                  Enviar Proposta de Troca
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="incoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Propostas Recebidas</CardTitle>
              <CardDescription>Trocas que outros usuários enviaram para você</CardDescription>
            </CardHeader>
            <CardContent>
              {incomingTrades.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma proposta de troca recebida</p>
              ) : (
                <div className="space-y-4">
                  {incomingTrades.map((trade) => (
                    <Card key={trade.id} className="border-l-4 border-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{trade.from_username[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{trade.from_username}</p>
                              <p className="text-sm text-gray-500">{new Date(trade.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(trade.status)} text-white`}>{trade.status}</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm font-medium mb-2">Oferece:</p>
                            <div className="bg-blue-50 p-3 rounded">
                              <p className="font-semibold">{trade.offered_card_name}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium mb-2">Quer:</p>
                            <div className="bg-green-50 p-3 rounded">
                              <p className="font-semibold">{trade.requested_card_name}</p>
                            </div>
                          </div>
                        </div>

                        {trade.message && (
                          <div className="bg-gray-50 p-3 rounded mb-4">
                            <p className="text-sm" dangerouslySetInnerHTML={{ __html: trade.message }}></p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => acceptTrade(trade.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            Aceitar
                          </Button>
                          <Button
                            onClick={() => rejectTrade(trade.id)}
                            variant="outline"
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                          >
                            Rejeitar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Trocas</CardTitle>
              <CardDescription>Todas as suas propostas enviadas e recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              {outgoingTrades.length === 0 && completedTrades.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma troca realizada ainda</p>
              ) : (
                <div className="space-y-4">
                  {[...outgoingTrades, ...completedTrades]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((trade) => (
                      <Card key={trade.id} className="border-l-4 border-gray-300">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">
                                {trade.from_user_id === currentUser.id
                                  ? `Para: ${trade.to_username}`
                                  : `De: ${trade.from_username}`}
                              </p>
                              <p className="text-sm text-gray-500">{new Date(trade.created_at).toLocaleDateString()}</p>
                            </div>
                            <Badge className={`${getStatusColor(trade.status)} text-white`}>{trade.status}</Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="text-center">
                              <p className="text-sm font-medium">Oferecido:</p>
                              <p className="font-semibold">{trade.offered_card_name}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">Solicitado:</p>
                              <p className="font-semibold">{trade.requested_card_name}</p>
                            </div>
                          </div>

                          {trade.message && (
                            <div className="mt-2 p-2 bg-gray-100 rounded">
                              <p className="text-sm" dangerouslySetInnerHTML={{ __html: trade.message }}></p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
