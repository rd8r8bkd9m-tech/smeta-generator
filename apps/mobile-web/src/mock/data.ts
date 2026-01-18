// Моковые данные для Status App

export interface User {
  id: string
  name: string
  avatar: string
  username: string
  isOnline?: boolean
}

export interface Story {
  id: string
  userId: string
  user: User
  type: 'image' | 'video' | 'text'
  content: string // URL для media, текст для text
  background?: string // для текстовых статусов
  createdAt: string
  expiresAt: string
  views: number
  reactions: Reaction[]
}

export interface Reaction {
  id: string
  userId: string
  user: User
  type: 'heart' | 'fire' | 'thumbs_up' | 'wow' | 'laugh'
  createdAt: string
}

export interface InboxItem {
  id: string
  type: 'reaction' | 'reply' | 'mention' | 'follow'
  user: User
  storyId?: string
  content?: string
  createdAt: string
  isRead: boolean
}

// Моковые пользователи
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Анна Петрова',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    username: 'anna_p',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Михаил Сидоров',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    username: 'mike_s',
    isOnline: false,
  },
  {
    id: '3',
    name: 'Елена Козлова',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    username: 'elena_k',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Дмитрий Иванов',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    username: 'dmitry_i',
    isOnline: false,
  },
  {
    id: '5',
    name: 'Ольга Смирнова',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    username: 'olga_s',
    isOnline: true,
  },
]

// Моковые статусы
export const mockStories: Story[] = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    type: 'image',
    content: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=393&h=852&fit=crop',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 мин назад
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(), // 23 часа
    views: 42,
    reactions: [
      {
        id: '1',
        userId: '2',
        user: mockUsers[1],
        type: 'heart',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
    ],
  },
  {
    id: '2',
    userId: '2',
    user: mockUsers[1],
    type: 'text',
    content: 'Всем отличного дня! ☀️',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 часа назад
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    views: 28,
    reactions: [],
  },
  {
    id: '3',
    userId: '3',
    user: mockUsers[2],
    type: 'video',
    content: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 мин назад
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23.25).toISOString(),
    views: 67,
    reactions: [
      {
        id: '2',
        userId: '1',
        user: mockUsers[0],
        type: 'fire',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
      {
        id: '3',
        userId: '4',
        user: mockUsers[3],
        type: 'wow',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    ],
  },
  {
    id: '4',
    userId: '4',
    user: mockUsers[3],
    type: 'text',
    content: 'Работа над новым проектом 🔥',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    views: 15,
    reactions: [],
  },
  {
    id: '5',
    userId: '5',
    user: mockUsers[4],
    type: 'image',
    content: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=393&h=852&fit=crop',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23.75).toISOString(),
    views: 89,
    reactions: [
      {
        id: '4',
        userId: '1',
        user: mockUsers[0],
        type: 'thumbs_up',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: '5',
        userId: '2',
        user: mockUsers[1],
        type: 'laugh',
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      },
    ],
  },
]

// Моковые элементы inbox
export const mockInboxItems: InboxItem[] = [
  {
    id: '1',
    type: 'reaction',
    user: mockUsers[1],
    storyId: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false,
  },
  {
    id: '2',
    type: 'reaction',
    user: mockUsers[0],
    storyId: '3',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    isRead: true,
  },
  {
    id: '3',
    type: 'reaction',
    user: mockUsers[3],
    storyId: '3',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    isRead: true,
  },
  {
    id: '4',
    type: 'mention',
    user: mockUsers[4],
    content: 'Отличная работа! @anna_p',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    isRead: false,
  },
  {
    id: '5',
    type: 'follow',
    user: mockUsers[2],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: true,
  },
]

// Текущий пользователь
export const currentUser: User = {
  id: 'current',
  name: 'Вы',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  username: 'you',
  isOnline: true,
}

// Фон для текстовых статусов
export const textBackgrounds = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
]