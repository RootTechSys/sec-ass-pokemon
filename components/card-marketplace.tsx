"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ShoppingCart, DollarSign, Search, TrendingUp } from "lucide-react"

interface MarketListing {
  id: number
  card_id: number
  seller_id: number
  seller_name: string
  price: number
  quantity: number
  created_at: string
  card_name: string
  card_type: string
  card_rarity: string
  card_image: string
  card_hp: number
  card_attack: number
  card_defense: number
}

interface UserCard {
  id: number
  card_id: number
  card_name: string
  card_type: string
  card_rarity: string
  card_image: string
  quantity: number
}

export default function CardMarketplace({ userId }: { userId: number }) {
  const [listings, setListings] = useState<MarketListing[]>([])
  const [userCards, setUserCards] = useState<UserCard[]>([])
  const [activeTab, setActiveTab] = useState<"buy" | "sell" | "my-listings">("buy")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterRarity, setFilterRarity] = useState("all")
  const [sortBy, setSortBy] = useState("price_asc")
  const [loading, setLoading] = useState(false)
  const [sellDialogOpen, setSellDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null)
  const [sellPrice, setSellPrice] = useState("")
  const [sellQuantity, setSellQuantity] = useState("1")

  useEffect(() => {
    fetchListings()
    fetchUserCards()
  }, [userId, searchTerm, filterType, filterRarity, sortBy])

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        type: filterType,
        rarity: filterRarity,
        sort: sortBy,
      })

      const response = await fetch(`/api/marketplace?${params}`)
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error("Error fetching listings:", error)
    }
  }

  const fetchUserCards = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/cards`)
      const data = await response.json()
      setUserCards(data.cards || [])
    } catch (error) {
      console.error("Error fetching user cards:", error)
    }
  }

  const buyCard = async (listingId: number, price: number) => {
    setLoading(true)
    try {
      const response = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, buyer_id: userId }),
      })

      if (response.ok) {
        fetchListings()
        fetchUserCards()
      }
    } catch (error) {
      console.error("Error buying card:", error)
    }
    setLoading(false)
  }

  const sellCard = async () => {
    if (!selectedCard || !sellPrice || !sellQuantity) return

    setLoading(true)
    try {
      const response = await fetch("/api/marketplace/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: selectedCard.card_id,
          seller_id: userId,
          price: Number.parseInt(sellPrice),
          quantity: Number.parseInt(sellQuantity),
        }),
      })

      if (response.ok) {
        setSellDialogOpen(false)
        setSelectedCard(null)
        setSellPrice("")
        setSellQuantity("1")
        fetchListings()
        fetchUserCards()
      }
    } catch (error) {
      console.error("Error selling card:", error)
    }
    setLoading(false)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "bg-gray-500"
      case "uncommon":
        return "bg-green-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      fire: "bg-red-500",
      water: "bg-blue-500",
      grass: "bg-green-500",
      electric: "bg-yellow-500",
      psychic: "bg-purple-500",
      ice: "bg-cyan-500",
      dragon: "bg-indigo-500",
      dark: "bg-gray-800",
      fairy: "bg-pink-500",
      fighting: "bg-orange-500",
      poison: "bg-violet-500",
      ground: "bg-amber-600",
      flying: "bg-sky-500",
      bug: "bg-lime-500",
      rock: "bg-stone-500",
      ghost: "bg-slate-600",
      steel: "bg-zinc-500",
      normal: "bg-gray-400",
    }
    return colors[type.toLowerCase()] || "bg-gray-500"
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.card_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || listing.card_type.toLowerCase() === filterType.toLowerCase()
    const matchesRarity = filterRarity === "all" || listing.card_rarity.toLowerCase() === filterRarity.toLowerCase()
    return matchesSearch && matchesType && matchesRarity
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Marketplace</h2>
          <p className="text-gray-400">Compre e venda cartas com outros treinadores</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "buy" ? "default" : "outline"}
            onClick={() => setActiveTab("buy")}
            className="text-sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Comprar
          </Button>
          <Button
            variant={activeTab === "sell" ? "default" : "outline"}
            onClick={() => setActiveTab("sell")}
            className="text-sm"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Vender
          </Button>
          <Button
            variant={activeTab === "my-listings" ? "default" : "outline"}
            onClick={() => setActiveTab("my-listings")}
            className="text-sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Minhas Vendas
          </Button>
        </div>
      </div>

      {activeTab === "buy" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar cartas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="fire">Fogo</SelectItem>
                <SelectItem value="water">Água</SelectItem>
                <SelectItem value="grass">Planta</SelectItem>
                <SelectItem value="electric">Elétrico</SelectItem>
                <SelectItem value="psychic">Psíquico</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as raridades</SelectItem>
                <SelectItem value="common">Comum</SelectItem>
                <SelectItem value="uncommon">Incomum</SelectItem>
                <SelectItem value="rare">Raro</SelectItem>
                <SelectItem value="epic">Épico</SelectItem>
                <SelectItem value="legendary">Lendário</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Preço: Menor para Maior</SelectItem>
                <SelectItem value="price_desc">Preço: Maior para Menor</SelectItem>
                <SelectItem value="name_asc">Nome: A-Z</SelectItem>
                <SelectItem value="name_desc">Nome: Z-A</SelectItem>
                <SelectItem value="newest">Mais Recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader className="pb-3">
                  <div className="aspect-square relative mb-3">
                    <img
                      src={listing.card_image || "/placeholder.svg"}
                      alt={listing.card_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge className={getRarityColor(listing.card_rarity)} variant="secondary">
                        {listing.card_rarity}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white">{listing.card_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(listing.card_type)} variant="secondary">
                      {listing.card_type}
                    </Badge>
                    <span className="text-sm text-gray-400">HP: {listing.card_hp}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Ataque</p>
                      <p className="text-white font-semibold">{listing.card_attack}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Defesa</p>
                      <p className="text-white font-semibold">{listing.card_defense}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Vendedor</p>
                      <p className="text-white font-semibold">{listing.seller_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Quantidade</p>
                      <p className="text-white font-semibold">{listing.quantity}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div>
                      <p className="text-2xl font-bold text-yellow-400">{listing.price}</p>
                      <p className="text-sm text-gray-400">moedas</p>
                    </div>
                    <Button
                      onClick={() => buyCard(listing.id, listing.price)}
                      disabled={loading || listing.seller_id === userId}
                      size="sm"
                    >
                      {loading ? "Comprando..." : "Comprar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma carta encontrada</p>
                <p className="text-sm text-gray-500 mt-2">Tente ajustar os filtros de busca</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === "sell" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {userCards.map((card) => (
              <Card key={card.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader className="pb-3">
                  <div className="aspect-square relative mb-3">
                    <img
                      src={card.card_image || "/placeholder.svg"}
                      alt={card.card_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getRarityColor(card.card_rarity)} variant="secondary">
                        {card.card_rarity}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white">{card.card_name}</CardTitle>
                  <div className="flex items-center justify-between">
                    <Badge className={getTypeColor(card.card_type)} variant="secondary">
                      {card.card_type}
                    </Badge>
                    <span className="text-sm text-gray-400">Quantidade: {card.quantity}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Dialog open={sellDialogOpen && selectedCard?.id === card.id} onOpenChange={setSellDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedCard(card)} className="w-full" disabled={card.quantity === 0}>
                        Vender
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Vender {card.card_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="price" className="text-white">
                            Preço (moedas)
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            value={sellPrice}
                            onChange={(e) => setSellPrice(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Digite o preço"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quantity" className="text-white">
                            Quantidade
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={sellQuantity}
                            onChange={(e) => setSellQuantity(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            min="1"
                            max={card.quantity}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={sellCard} disabled={loading} className="flex-1">
                            {loading ? "Vendendo..." : "Confirmar Venda"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSellDialogOpen(false)
                              setSelectedCard(null)
                            }}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {userCards.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Você não possui cartas para vender</p>
                <p className="text-sm text-gray-500 mt-2">Compre pacotes para obter cartas!</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
