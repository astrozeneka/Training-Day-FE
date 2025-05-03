import { User } from "./models/Interfaces"

export interface Msg {
  id: number
  conversation_id: number
  sender_id: number
  sender_name: string
  content: string
  type: string
  status: 'sent' | 'delivered' | 'read' | 'sending'  // sent, delivered, read but in the frontend, it will have 'sending'
  created_at: string
}

export interface Member {
    id: number
    created_at: string
    updated_at: string
    conversation_id: number
    user_id: number
    joined_at: string
    last_seen_at: string
    unread_count: number
    user: User
}

export interface Conversation {
    id: number
    created_at: string
    updated_at: string
    type: string
    name: string
    unread_count: number
    latest_message: Msg
    members: Member[]
    avatar: string | null
}