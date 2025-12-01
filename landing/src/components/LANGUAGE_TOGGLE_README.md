# Language Toggle Component 🌐

Красивый переключатель языка для Saturway с океанской тематикой и плавными анимациями.

## 🎨 Варианты компонента

### 1. LanguageToggle (с иконкой)
Полная версия с иконкой глобуса для дополнительной визуализации.

```tsx
import { LanguageToggle } from './components/LanguageToggle';

<LanguageToggle 
  currentLanguage={language} 
  onToggle={setLanguage}
  className="optional-class"
/>
```

**Когда использовать:**
- В меню настроек
- На страницах с большим пространством
- Когда нужна дополнительная визуализация

### 2. LanguageToggleCompact (компактная)
Минималистичная версия без иконки - используется на экранах авторизации.

```tsx
import { LanguageToggleCompact } from './components/LanguageToggle';

<LanguageToggleCompact 
  currentLanguage={language} 
  onToggle={setLanguage}
  className="optional-class"
/>
```

**Когда использовать:**
- В верхнем правом углу экранов (как на auth screens)
- В тесных пространствах
- Минималистичный дизайн

### 3. LanguageToggleDark (для светлых фонов)
Адаптированная версия для светлых фонов с темными цветами.

```tsx
import { LanguageToggleDark } from './components/LanguageToggle';

<LanguageToggleDark 
  currentLanguage={language} 
  onToggle={setLanguage}
  className="optional-class"
/>
```

**Когда использовать:**
- На светлых фонах (bg-background)
- В карточках с белым фоном
- В светлой теме приложения

## 🔧 Интеграция с LanguageContext

### Базовое использование:

```tsx
import { useLanguage } from './components/LanguageContext';
import { LanguageToggleCompact } from './components/LanguageToggle';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      {/* Переключатель в правом верхнем углу */}
      <div className="fixed right-6 top-6 z-20">
        <LanguageToggleCompact
          currentLanguage={language}
          onToggle={setLanguage}
        />
      </div>
      
      {/* Использование переводов */}
      <h1>{t('loading.appName')}</h1>
      <p>{t('loading.subtitle')}</p>
    </div>
  );
}
```

### Обернуть приложение в LanguageProvider:

```tsx
import { LanguageProvider } from './components/LanguageContext';
import { AuthFlow } from './components/AuthFlow';

function App() {
  return (
    <LanguageProvider>
      <AuthFlow />
    </LanguageProvider>
  );
}
```

## 📝 Доступные переводы

Все переводы находятся в `/components/LanguageContext.tsx`:

### Категории:
- **loading** - LoadingScreen тексты
- **permission** - PermissionScreen тексты
- **error** - ErrorScreen тексты
- **demo** - AuthScreensDemo тексты

### Пример добавления новых переводов:

```tsx
// В LanguageContext.tsx
const translations = {
  ru: {
    'myscreen.title': 'Мой экран',
    'myscreen.subtitle': 'Описание экрана',
  },
  en: {
    'myscreen.title': 'My Screen',
    'myscreen.subtitle': 'Screen description',
  },
};

// Использование
const { t } = useLanguage();
<h1>{t('myscreen.title')}</h1>
```

## ✨ Особенности

### Анимации
- **Spring transition** - плавный переход фонового слайдера
- **Duration**: 400ms с stiffness и damping
- **Scale animation** - активный язык немного больше
- **Hover effects** - иконка глобуса масштабируется при наведении

### Стили
- **Backdrop-blur** - эффект матового стекла
- **Океанский градиент** - from-[#4A9FD8] to-[#52C9C1]
- **Shadow** - мягкая тень под активным языком
- **White overlay** - полупрозрачный белый фон

### Цвета

**Для темного фона (LanguageToggle, LanguageToggleCompact):**
- Фон: `bg-white/10`
- Активный слайдер: `bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1]`
- Активный текст: `#ffffff`
- Неактивный текст: `rgba(255, 255, 255, 0.6)`

**Для светлого фона (LanguageToggleDark):**
- Фон: `bg-muted/50`
- Активный слайдер: `bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1]`
- Активный текст: `#ffffff`
- Неактивный текст: `rgba(74, 159, 216, 0.6)`

## 🎯 Props

```tsx
interface LanguageToggleProps {
  currentLanguage: 'ru' | 'en';  // Текущий выбранный язык
  onToggle: (lang: 'ru' | 'en') => void;  // Callback при переключении
  className?: string;  // Дополнительные CSS классы (опционально)
}
```

## 📱 Размеры

- **Высота**: 32px (h-8)
- **Ширина одной кнопки**: 36px
- **Общая ширина** (compact): ~88px
- **Общая ширина** (с иконкой): ~136px
- **Отступы**: padding-1 (4px)

## 🎨 Кастомизация

### Добавить свой язык:

```tsx
// В LanguageToggle.tsx
const languages = [
  { code: 'ru' as const, label: 'RU', name: 'Русский' },
  { code: 'en' as const, label: 'EN', name: 'English' },
  { code: 'es' as const, label: 'ES', name: 'Español' },  // Добавить
];

// Обновить тип
type Language = 'ru' | 'en' | 'es';
```

### Изменить цвета градиента:

```tsx
// Найти в компоненте
className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1]"

// Заменить на свой градиент
className="bg-gradient-to-r from-[#FF6B6B] to-[#FFD93D]"
```

### Изменить размер:

```tsx
// Увеличить размер
<div className="h-10 w-10">  {/* было h-8 w-8 */}
  <Globe className="h-5 w-5" />  {/* было h-4 w-4 */}
</div>
```

## 🌊 Где используется

В проекте Saturway переключатель языка используется:

1. **LoadingScreen** - верхний правый угол
2. **PermissionScreen** - верхний правый угол
3. **ErrorScreen** - верхний правый угол
4. **AuthScreensDemo** - верхний правый угол и на главном меню

Все экраны используют `LanguageToggleCompact` для экономии места.

## 🚀 Быстрый старт

1. Добавить переключатель на экран:
```tsx
import { LanguageToggleCompact } from './components/LanguageToggle';
import { useLanguage } from './components/LanguageContext';

function MyScreen() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div>
      <div className="fixed right-6 top-6 z-20">
        <LanguageToggleCompact
          currentLanguage={language}
          onToggle={setLanguage}
        />
      </div>
      {/* Your content */}
    </div>
  );
}
```

2. Обернуть в LanguageProvider:
```tsx
<LanguageProvider>
  <MyScreen />
</LanguageProvider>
```

3. Использовать переводы:
```tsx
const { t } = useLanguage();
<h1>{t('myscreen.title')}</h1>
```

## 📊 Производительность

- Минимальный размер: ~2KB (gzipped)
- Нет внешних зависимостей (кроме motion/react)
- Оптимизированные анимации (GPU acceleration)
- Минимальные ререндеры

---

**Версия**: 1.0.0  
**Автор**: Saturway Team  
**Дата создания**: Ноябрь 2025
