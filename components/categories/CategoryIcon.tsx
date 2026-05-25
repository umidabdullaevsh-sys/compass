import {
  BookOpen, Truck, Brain, GraduationCap, Dumbbell,
  Wallet, Users, Heart, Tag
} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Truck, Brain, GraduationCap, Dumbbell, Wallet, Users, Heart,
}

interface Props {
  name: string
  color?: string
  size?: number
  className?: string
}

export default function CategoryIcon({ name, color, size = 16, className }: Props) {
  const Icon = ICON_MAP[name] ?? Tag
  return <Icon size={size} color={color} className={className} />
}
