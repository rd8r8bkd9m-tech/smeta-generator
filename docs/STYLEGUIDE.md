# Status App — Style Guide

## 🎨 Дизайн-система

### Цветовая палитра

Status App использует современную dark-first палитру с холодным голубым акцентом.

#### Основные цвета (CSS переменные)

```css
/* Dark theme (по умолчанию) */
--bg-0: 0 0 0          /* Полностью черный */
--bg-1: 10 10 15       /* Темно-синий */
--bg-2: 17 17 24       /* Серый для карточек */

--surface: 255 255 255 / 0.08    /* Стеклянные поверхности */
--surface-hover: 255 255 255 / 0.12

--stroke: 255 255 255 / 0.12    /* Разделители */

--text-primary: 255 255 255
--text-secondary: 255 255 255 / 0.7
--text-tertiary: 255 255 255 / 0.5

--accent: 59 130 246     /* Голубой акцент */
--accent-hover: 37 99 235
--accent-light: 59 130 246 / 0.2

--success: 16 185 129
--warning: 245 158 11
--danger: 239 68 68
```

#### Light theme

```css
--bg-0: 255 255 255
--bg-1: 248 250 252
--bg-2: 255 255 255

--surface: 0 0 0 / 0.05
--surface-hover: 0 0 0 / 0.08

--stroke: 0 0 0 / 0.12

--text-primary: 0 0 0
--text-secondary: 0 0 0 / 0.7
--text-tertiary: 0 0 0 / 0.5

--accent: 59 130 246
--accent-hover: 37 99 235
--accent-light: 59 130 246 / 0.1
```

### Типографика

```css
/* Заголовки */
--heading-1: 28px / 32px / 600 / Inter
--heading-2: 22px / 26px / 600 / Inter
--heading-3: 18px / 22px / 600 / Inter

/* Текст */
--body: 15px / 20px / 400 / Inter
--body-medium: 15px / 20px / 500 / Inter

/* Малый текст */
--caption: 13px / 16px / 400 / Inter
--caption-medium: 13px / 16px / 500 / Inter

/* Кнопки */
--button: 15px / 20px / 500 / Inter
```

### Spacing система

```css
--space-xs: 4px
--space-sm: 8px
--space-md: 12px
--space-lg: 16px
--space-xl: 24px
--space-2xl: 32px
--space-3xl: 48px
--space-4xl: 64px
```

### Радиусы

```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 20px
--radius-2xl: 24px
--radius-full: 9999px
```

### Тени

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
--shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3)
```

## 🧩 Компоненты

### Glass Card

Стеклянные карточки с blur эффектом для премиального вида.

```tsx
import { GlassCard } from '../components/GlassCard'

<GlassCard className="p-6" hover>
  {/* Content */}
</GlassCard>
```

### Primary Button

Основные действия с анимациями и состояниями.

```tsx
import { PrimaryButton } from '../components/PrimaryButton'

<PrimaryButton onClick={handleClick} loading={isLoading} fullWidth>
  Действие
</PrimaryButton>
```

### Story Ring

Кольцо статуса с прогрессом и градиентом.

```tsx
import { StoryRing } from '../components/StoryRing'

<StoryRing
  size={64}
  hasUnseen={true}
  progress={0.5}
  imageUrl={avatarUrl}
/>
```

### Bottom Sheet

Модальные окна снизу с drag-to-close.

```tsx
import { BottomSheet } from '../components/BottomSheet'

<BottomSheet isOpen={isOpen} onClose={handleClose} title="Заголовок">
  {/* Content */}
</BottomSheet>
```

### Toast Notifications

Уведомления с auto-dismiss.

```tsx
import { useToast } from '../hooks/useToast'

const { toast } = useToast()

toast.success('Успех!', 'Операция выполнена')
toast.error('Ошибка', 'Что-то пошло не так')
```

### Segmented Control

Таб-контрол с анимированным индикатором.

```tsx
import { SegmentedControl } from '../components/SegmentedControl'

<SegmentedControl
  options={[
    { value: 'all', label: 'Все' },
    { value: 'unread', label: 'Непрочитанные' }
  ]}
  value={selectedTab}
  onChange={setSelectedTab}
/>
```

## 🎭 Анимации

### Framer Motion паттерны

```tsx
// Появление с stagger
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
  Item {index}
</motion.div>

// Scale анимации для кнопок
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Button
</motion.button>

// Spring анимации
<motion.div
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  transition={{
    type: 'spring',
    damping: 30,
    stiffness: 300
  }}
>
  Bottom Sheet
</motion.div>
```

### Тайминги

```tsx
const animations = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}
```

## ♿ Accessibility

### Focus states

Все интерактивные элементы имеют видимые focus states:

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg0;
}
```

### ARIA labels

```tsx
<button aria-label="Закрыть меню">
  <X size={20} />
</button>

<input
  aria-label="Поиск"
  role="searchbox"
/>
```

### Touch targets

Минимальный размер 44×44px для всех touch элементов.

### Screen readers

- Semantic HTML элементы
- ARIA роли и состояния
- Описательные labels

## 📱 Мобильная оптимизация

### Safe areas

```css
.safe-area-inset {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

### iOS Safari specifics

```css
html {
  -webkit-text-size-adjust: 100%;
}
```

## 🛠 Использование

### Импорты

```tsx
// Отдельные компоненты
import { GlassCard, PrimaryButton } from '../components'

// Или через index
import { GlassCard, PrimaryButton } from '../components'
```

### Hooks

```tsx
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'

const { isDark, toggleTheme } = useTheme()
const { toast } = useToast()
```

### Темы

```tsx
import { useTheme } from '../hooks/useTheme'

const { theme, toggleTheme } = useTheme()

// theme: 'dark' | 'light'
// toggleTheme() - переключить
```

## 🎯 Лучшие практики

### 1. Используйте токены вместо hardcoded значений

```tsx
// ✅ Хорошо
className="text-textPrimary bg-surface"

// ❌ Плохо
className="text-white bg-black/10"
```

### 2. Добавляйте accessibility

```tsx
// ✅ Хорошо
<button
  onClick={handleClick}
  aria-label="Удалить элемент"
  className="focus-ring"
>
  <TrashIcon />
</button>

// ❌ Плохо
<button onClick={handleClick}>
  <TrashIcon />
</button>
```

### 3. Используйте motion компоненты

```tsx
// ✅ Хорошо
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Кнопка
</motion.button>

// ❌ Плохо
<button className="hover:scale-105 active:scale-95">
  Кнопка
</button>
```

### 4. Следуйте spacing системе

```tsx
// ✅ Хорошо
className="space-y-4 p-6"

// ❌ Плохо
className="space-y-5 p-7"
```

## 🚀 Production готовность

Status App соответствует всем требованиям:

- ✅ Premium dark-first дизайн
- ✅ Stories-first UX паттерн
- ✅ High-fidelity экраны без заглушек
- ✅ PWA с offline поддержкой
- ✅ Accessibility (WCAG AA)
- ✅ Touch-friendly интерфейс
- ✅ Type-safe код
- ✅ Responsive дизайн
- ✅ Performance оптимизации

**Ready for App Store! 🎉**