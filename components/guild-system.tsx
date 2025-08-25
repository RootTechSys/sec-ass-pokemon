"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Crown, Shield, Star, Plus, Search } from "lucide-react"

interface Guild {
  id: number
  name: string
  description: string
  leader_id: number
  leader_name: string
  member_count: number
  max_members: number
  level: number
  experience: number
  created_at: string
  is_public: boolean
  requirements?: string
}

interface GuildMember {
  id: number
  user_id: number
  username: string
  role: "leader" | "officer" | "member"
  joined_at: string
  contribution_points: number
  last_active: string
}

interface GuildApplication {
  id: number
  guild_id: number
  user_id: number
  username: string
  message: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export default function GuildSystem({ userId }: { userId: number }) {
  const [userGuild, setUserGuild] = useState<Guild | null>(null)
  const [availableGuilds, setAvailableGuilds] = useState<Guild[]>([])
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([])
  const [guildApplications, setGuildApplications] = useState<GuildApplication[]>([])
  const [activeTab, setActiveTab] = useState<"my-guild" | "browse" | "create">("my-guild")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [createGuildOpen, setCreateGuildOpen] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")

  const [newGuild, setNewGuild] = useState({
    name: "",
    description: "",
    requirements: "",
    is_public: true,
    max_members: 20,
  })

  useEffect(() => {
    fetchUserGuild()
    fetchAvailableGuilds()
  }, [userId])

  useEffect(() => {
    if (userGuild) {
      fetchGuildMembers()
      fetchGuildApplications()
    }
  }, [userGuild])

  const fetchUserGuild = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/guild`)
      const data = await response.json()
      setUserGuild(data.guild || null)
    } catch (error) {
      console.error("Error fetching user guild:", error)
    }
  }

  const fetchAvailableGuilds = async () => {
    try {
      const response = await fetch("/api/guilds")
      const data = await response.json()
      setAvailableGuilds(data.guilds || [])
    } catch (error) {
      console.error("Error fetching guilds:", error)
    }
  }

  const fetchGuildMembers = async () => {
    if (!userGuild) return
    try {
      const response = await fetch(`/api/guilds/${userGuild.id}/members`)
      const data = await response.json()
      setGuildMembers(data.members || [])
    } catch (error) {
      console.error("Error fetching guild members:", error)
    }
  }

  const fetchGuildApplications = async () => {
    if (!userGuild) return
    try {
      const response = await fetch(`/api/guilds/${userGuild.id}/applications`)
      const data = await response.json()
      setGuildApplications(data.applications || [])
    } catch (error) {
      console.error("Error fetching guild applications:", error)
    }
  }

  const createGuild = async () => {
    if (!newGuild.name || !newGuild.description) return

    setLoading(true)
    try {
      const response = await fetch("/api/guilds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newGuild, leader_id: userId }),
      })

      if (response.ok) {
        setCreateGuildOpen(false)
        setNewGuild({ name: "", description: "", requirements: "", is_public: true, max_members: 20 })
        fetchUserGuild()
      }
    } catch (error) {
      console.error("Error creating guild:", error)
    }
    setLoading(false)
  }

  const applyToGuild = async (guildId: number) => {
    setLoading(true)
    try {
      const response = await fetch("/api/guilds/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guild_id: guildId,
          user_id: userId,
          message: applicationMessage,
        }),
      })

      if (response.ok) {
        setApplicationMessage("")
        fetchAvailableGuilds()
      }
    } catch (error) {
      console.error("Error applying to guild:", error)
    }
    setLoading(false)
  }

  const handleApplication = async (applicationId: number, action: "approve" | "reject") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/guilds/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchGuildApplications()
        fetchGuildMembers()
      }
    } catch (error) {
      console.error("Error handling application:", error)
    }
    setLoading(false)
  }

  const leaveGuild = async () => {
    if (!userGuild) return

    setLoading(true)
    try {
      const response = await fetch(`/api/guilds/${userGuild.id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })

      if (response.ok) {
        setUserGuild(null)
        setGuildMembers([])
        fetchAvailableGuilds()
      }
    } catch (error) {
      console.error("Error leaving guild:", error)
    }
    setLoading(false)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "leader":
        return <Crown className="w-4 h-4 text-yellow-400" />
      case "officer":
        return <Shield className="w-4 h-4 text-blue-400" />
      default:
        return <Users className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "leader":
        return "Líder"
      case "officer":
        return "Oficial"
      default:
        return "Membro"
    }
  }

  const filteredGuilds = availableGuilds.filter(
    (guild) =>
      guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guild.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const userRole = guildMembers.find((member) => member.user_id === userId)?.role

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Sistema de Guildas</h2>
          <p className="text-gray-400">Una-se a outros treinadores e conquiste objetivos juntos</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "my-guild" ? "default" : "outline"}
            onClick={() => setActiveTab("my-guild")}
            className="text-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Minha Guilda
          </Button>
          <Button
            variant={activeTab === "browse" ? "default" : "outline"}
            onClick={() => setActiveTab("browse")}
            className="text-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Explorar
          </Button>
          <Button
            variant={activeTab === "create" ? "default" : "outline"}
            onClick={() => setActiveTab("create")}
            className="text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar
          </Button>
        </div>
      </div>

      {activeTab === "my-guild" && (
        <>
          {userGuild ? (
            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white flex items-center gap-2">
                        {userGuild.name}
                        <Badge variant="outline" className="text-sm">
                          Nível {userGuild.level}
                        </Badge>
                      </CardTitle>
                      <p className="text-gray-400 mt-2">{userGuild.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Membros</p>
                      <p className="text-2xl font-bold text-white">
                        {userGuild.member_count}/{userGuild.max_members}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Experiência</p>
                      <p className="text-xl font-bold text-white">{userGuild.experience}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Membros Ativos</p>
                      <p className="text-xl font-bold text-white">{userGuild.member_count}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <Crown className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Líder</p>
                      <p className="text-xl font-bold text-white">{userGuild.leader_name}</p>
                    </div>
                  </div>

                  <Tabs defaultValue="members" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="members">Membros</TabsTrigger>
                      <TabsTrigger value="applications">Candidaturas</TabsTrigger>
                      <TabsTrigger value="settings">Configurações</TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="space-y-4">
                      <div className="grid gap-3">
                        {guildMembers.map((member) => (
                          <Card key={member.id} className="bg-gray-700 border-gray-600">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {getRoleIcon(member.role)}
                                  <div>
                                    <p className="text-white font-semibold">{member.username}</p>
                                    <p className="text-sm text-gray-400">{getRoleName(member.role)}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-400">Contribuição</p>
                                  <p className="text-white font-semibold">{member.contribution_points} pts</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="applications" className="space-y-4">
                      {(userRole === "leader" || userRole === "officer") && (
                        <div className="grid gap-3">
                          {guildApplications
                            .filter((app) => app.status === "pending")
                            .map((application) => (
                              <Card key={application.id} className="bg-gray-700 border-gray-600">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-white font-semibold">{application.username}</p>
                                      <p className="text-sm text-gray-400 mt-1">{application.message}</p>
                                      <p className="text-xs text-gray-500 mt-2">
                                        {new Date(application.created_at).toLocaleDateString("pt-BR")}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleApplication(application.id, "approve")}
                                        disabled={loading}
                                      >
                                        Aceitar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleApplication(application.id, "reject")}
                                        disabled={loading}
                                      >
                                        Rejeitar
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          {guildApplications.filter((app) => app.status === "pending").length === 0 && (
                            <p className="text-center text-gray-400 py-8">Nenhuma candidatura pendente</p>
                          )}
                        </div>
                      )}
                      {userRole === "member" && (
                        <p className="text-center text-gray-400 py-8">
                          Apenas líderes e oficiais podem ver candidaturas
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                      <div className="flex justify-center">
                        <Button variant="destructive" onClick={leaveGuild} disabled={loading || userRole === "leader"}>
                          {userRole === "leader" ? "Líderes não podem sair" : "Sair da Guilda"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Você não está em uma guilda</h3>
                <p className="text-gray-400 mb-6">
                  Una-se a uma guilda para colaborar com outros treinadores e desbloquear benefícios exclusivos
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setActiveTab("browse")}>Explorar Guildas</Button>
                  <Button variant="outline" onClick={() => setActiveTab("create")}>
                    Criar Guilda
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === "browse" && (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar guildas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuilds.map((guild) => (
              <Card key={guild.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">{guild.name}</CardTitle>
                    <Badge variant="outline">Nível {guild.level}</Badge>
                  </div>
                  <p className="text-sm text-gray-400">{guild.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Membros</p>
                      <p className="text-white font-semibold">
                        {guild.member_count}/{guild.max_members}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Líder</p>
                      <p className="text-white font-semibold">{guild.leader_name}</p>
                    </div>
                  </div>

                  {guild.requirements && (
                    <div>
                      <p className="text-sm text-gray-400">Requisitos:</p>
                      <p className="text-sm text-white">{guild.requirements}</p>
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        disabled={userGuild !== null || guild.member_count >= guild.max_members}
                      >
                        {userGuild
                          ? "Já está em uma guilda"
                          : guild.member_count >= guild.max_members
                            ? "Guilda cheia"
                            : "Candidatar-se"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Candidatar-se a {guild.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="message" className="text-white">
                            Mensagem para os líderes
                          </Label>
                          <Textarea
                            id="message"
                            value={applicationMessage}
                            onChange={(e) => setApplicationMessage(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Conte por que quer se juntar a esta guilda..."
                          />
                        </div>
                        <Button
                          onClick={() => applyToGuild(guild.id)}
                          disabled={loading || !applicationMessage.trim()}
                          className="w-full"
                        >
                          {loading ? "Enviando..." : "Enviar Candidatura"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGuilds.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma guilda encontrada</p>
                <p className="text-sm text-gray-500 mt-2">Tente ajustar sua busca ou crie uma nova guilda</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === "create" && (
        <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">Criar Nova Guilda</CardTitle>
            <p className="text-gray-400">Crie sua própria guilda e lidere outros treinadores</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="guild-name" className="text-white">
                Nome da Guilda
              </Label>
              <Input
                id="guild-name"
                value={newGuild.name}
                onChange={(e) => setNewGuild({ ...newGuild, name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Digite o nome da guilda"
              />
            </div>

            <div>
              <Label htmlFor="guild-description" className="text-white">
                Descrição
              </Label>
              <Textarea
                id="guild-description"
                value={newGuild.description}
                onChange={(e) => setNewGuild({ ...newGuild, description: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Descreva os objetivos e valores da guilda"
              />
            </div>

            <div>
              <Label htmlFor="guild-requirements" className="text-white">
                Requisitos (opcional)
              </Label>
              <Input
                id="guild-requirements"
                value={newGuild.requirements}
                onChange={(e) => setNewGuild({ ...newGuild, requirements: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Ex: Nível mínimo 10, ter pelo menos 5 cartas raras"
              />
            </div>

            <div>
              <Label htmlFor="max-members" className="text-white">
                Máximo de Membros
              </Label>
              <Input
                id="max-members"
                type="number"
                value={newGuild.max_members}
                onChange={(e) => setNewGuild({ ...newGuild, max_members: Number.parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600 text-white"
                min="5"
                max="50"
              />
            </div>

            <Button
              onClick={createGuild}
              disabled={loading || !newGuild.name || !newGuild.description || userGuild !== null}
              className="w-full"
            >
              {loading ? "Criando..." : userGuild ? "Já está em uma guilda" : "Criar Guilda"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
