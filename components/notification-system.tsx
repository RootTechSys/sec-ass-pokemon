"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, Gift, Sword, Users, Star } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Notification {
  id: number
  type: "trade" | "battle" | "achievement" | "pack" | "system"
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: any
}

export default function NotificationSystem() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadNotifications()
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/user/${user?.id}/notifications`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter((n) => !n.read).length)
    }
  }

  const mockNotifications: Notification[] = [
    {
      id: 1,
      type: "trade",
      title: "Nova Proposta de Troca",
      message: "João quer trocar seu Charizard pelo seu Pikachu",
      read: false,
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 2,
      type: "achievement",
      title: "Conquista Desbloqueada!",
      message: "Você desbloqueou 'Primeiro Passo' e ganhou 25 moedas!",
      read: false,
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 3,
      type: "battle",
      title: "Vitória na Batalha!",
      message: "Você derrotou um Blastoise selvagem e ganhou 50 moedas!",
      read: true,
      createdAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 4,
      type: "pack",
      title: "Carta Rara Encontrada!",
      message: "Você encontrou um Mewtwo lendário no seu último pacote!",
      read: true,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 5,
      type: "system",
      title: "Bem-vindo ao PokéCards!",
      message: "Comece sua jornada comprando seu primeiro pacote de cartas!",
      read: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      })

      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Erro ao marcar como lida:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/user/${user?.id}/notifications/read-all`, {
        method: "POST",
      })

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })

      const notification = notifications.find((n) => n.id === notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Erro ao deletar notificação:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "trade":
        return <Users className="w-4 h-4" />
      case "battle":
        return <Sword className="w-4 h-4" />
      case "achievement":
        return <Star className="w-4 h-4" />
      case "pack":
        return <Gift className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "trade":
        return "bg-blue-500"
      case "battle":
        return "bg-red-500"
      case "achievement":
        return "bg-yellow-500"
      case "pack":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return `${Math.floor(diffInMinutes / 1440)}d atrás`
  }

  if (!user) return null

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative p-2">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50">
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notificações</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                      Marcar todas como lidas
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Nenhuma notificação</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${getNotificationColor(notification.type)} text-white flex-shrink-0`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{formatTimeAgo(notification.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs px-2 py-1 h-auto"
                                >
                                  Marcar como lida
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-500 hover:text-red-700 p-1 h-auto"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
