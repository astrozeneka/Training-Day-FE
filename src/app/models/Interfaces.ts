import IMessage from "./IMessages"

export interface User {
    id: number
    role_id: number
    name: string
    email: string
    avatar: string
    email_verified_at: any
    settings: any
    created_at: string
    updated_at: string
    firstname: string
    lastname: string
    phone: string
    address: any
    profile_image_id: any
    weight: any
    height: any
    program_id: any
    age: any
    sex: any
    expires_at: any
    email_verification_token: any
    stripe_subscription_id: any
    stripe_customer_id: any
    function: string
    provider: any
    provider_uid: any
    renewable_id: string
    renewable_last_verified_on: string
    trial_expires_at: any
    active_on: string
    country: any
    city: any
    postal_code: any
    thumbnail64: any
    grouped_perishables: GroupedPerishables
    trial_is_active: boolean
    user_settings: UserSettings
    privileges: string[]
    isAvailable: boolean
    profile_image: any
    subscription: any
    perishables: Perishable[]
    appointments: any[]
  }
  
  export interface GroupedPerishables {
    "personal-trainer": PersonalTrainer
  }
  
  export interface PersonalTrainer {
    id: number
    created_at: string
    updated_at: string
    slug: string
    label: string
    expires_at: any
    consumables: number
    user_id: number
    payment_id: number
  }
  
  export interface UserSettings {
    locked: string, // "true" or "false"
    disable_coach_messages: string // "true" or "false"
    disable_nutritionist_messages: string // "true" or "false"
    disable_messages: string
    unavailable: any
    available: any


    activeTo: any
    activeFrom: any
    pauseDays: any
  }
  
  export interface Perishable {
    id: number
    created_at: string
    updated_at: string
    slug: string
    label: string
    expires_at?: string
    consumables: number
    user_id: number
    payment_id: number
  }
  
export interface Discussion extends User {
  messages: IMessage[]
  unread: number
  isActive: boolean
  avatar_url: any
}

export type PlatformType = 'android' | 'ios'