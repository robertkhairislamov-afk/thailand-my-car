# 🧩 Saturway Landing - Components Guide

Детальный гайд по всем компонентам лендинга с примерами кода.

---

## 📦 Component Architecture

```
Landing.tsx (Main)
├── Navigation Bar
│   ├── Logo + Brand
│   ├── Navigation Links
│   ├── LanguageToggle
│   └── RippleButton (CTA)
│
├── Hero Section
│   ├── Background Particles (20x)
│   ├── Left Column
│   │   ├── Badge (Sparkles icon)
│   │   ├── Headline
│   │   ├── Subtitle
│   │   ├── CTA Buttons (2x)
│   │   └── Stats Grid (4x)
│   └── Right Column
│       ├── Phone Mockup
│       └── Floating Elements (2x)
│
├── Features Section
│   └── AnimatedOceanCard (4x)
│       ├── Icon (gradient circle)
│       ├── Title
│       └── Description
│
├── How It Works Section
│   └── AnimatedOceanCard (3x)
│       ├── Icon (numbered badge)
│       ├── Title
│       └── Description
│
├── Benefits Section
│   ├── Left Column (Text + 4 cards)
│   └── Right Column (Animated visual)
│
├── Testimonials Section
│   └── AnimatedOceanCard (3x)
│       ├── Star Rating
│       ├── Quote
│       └── Author (icon + name)
│
├── CTA Section
│   └── AnimatedOceanCard
│       ├── Headline
│       ├── Email Form
│       └── Privacy Notice
│
└── Footer
    ├── Brand Column
    ├── Product Column
    ├── Company Column
    └── Legal Column
```

---

## 🎨 Component Examples

### 1. Navigation Bar

```tsx
<nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-card/95 backdrop-blur-lg">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
    {/* Logo */}
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1] p-1">
        <img src={logoImage} alt="Saturway" />
      </div>
      <span className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] bg-clip-text text-xl font-bold text-transparent">
        Saturway
      </span>
    </div>
    
    {/* Desktop Nav */}
    <div className="hidden items-center gap-8 md:flex">
      <a href="#features">Features</a>
      <a href="#how-it-works">How it works</a>
      <a href="#testimonials">Testimonials</a>
      <LanguageToggle />
      <RippleButton>Get Started</RippleButton>
    </div>
  </div>
</nav>
```

**Key Features:**
- ✅ Fixed position (sticky)
- ✅ Backdrop blur effect
- ✅ Gradient logo
- ✅ Responsive (desktop/mobile)
- ✅ Language toggle
- ✅ Ocean colors

---

### 2. Hero Section

```tsx
<section className="relative overflow-hidden pt-32 pb-20">
  {/* Animated Particles */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-2 w-2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${oceanColors[i % 3]} 0%, transparent 70%)`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>

  {/* Content */}
  <motion.div style={{ y: heroY, opacity: heroOpacity }}>
    <div className="grid items-center gap-12 lg:grid-cols-2">
      {/* Left: Text + CTAs */}
      <div className="space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#4A9FD8]/30 bg-[#4A9FD8]/10 px-4 py-2">
          <Sparkles className="h-4 w-4 text-[#4A9FD8]" />
          <span>{t('landing.hero.badge')}</span>
        </div>
        
        {/* Headline */}
        <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl">
          {t('landing.hero.title')}
          <span className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] bg-clip-text text-transparent">
            {' '}{t('landing.hero.titleAccent')}
          </span>
        </h1>
        
        {/* CTAs */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <RippleButton className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1]">
            Start Free
          </RippleButton>
          <RippleButton className="border-2 border-[#4A9FD8]/30">
            Watch Demo
          </RippleButton>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat, index) => (
            <div className="text-center">
              <div className="mb-1 text-3xl font-bold text-[#4A9FD8]">
                {stat.value}
                {index === 3 && <Star className="inline h-5 w-5 fill-[#FFD93D]" />}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right: Phone Mockup */}
      <div className="relative">
        <div className="aspect-[9/19.5] rounded-[3rem] border-8 bg-gradient-to-b from-[#4A9FD8]/20 to-[#52C9C1]/20">
          {/* App Preview */}
        </div>
        
        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -right-4 top-20 rounded-2xl bg-card p-4 shadow-xl"
        >
          <Battery className="h-5 w-5 text-[#52C9C1]" />
          <span>85%</span>
        </motion.div>
      </div>
    </div>
  </motion.div>
</section>
```

**Key Features:**
- ✅ 20 floating particles
- ✅ Parallax scroll effect
- ✅ Gradient headline
- ✅ Badge with icon
- ✅ Dual CTAs
- ✅ Stats with star icon
- ✅ Phone mockup
- ✅ Floating indicators

---

### 3. Features Section

```tsx
<section id="features" className="py-20 px-6">
  <div className="mx-auto max-w-7xl">
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-16 text-center"
    >
      <h2 className="mb-4 text-4xl font-bold md:text-5xl">
        {t('landing.features.title')}
      </h2>
      <p className="text-xl text-muted-foreground">
        {t('landing.features.subtitle')}
      </p>
    </motion.div>

    {/* Cards Grid */}
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {features.map((feature, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
        >
          <AnimatedOceanCard delay={index * 0.1}>
            <div className="p-6">
              {/* Icon */}
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient}`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              
              {/* Title */}
              <h3 className="mb-3 text-xl font-semibold">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </AnimatedOceanCard>
        </motion.div>
      ))}
    </div>
  </div>
</section>
```

**Features Data:**
```tsx
const features = [
  {
    icon: Brain,
    title: 'AI Analytics',
    description: 'Smart recommendations based on your patterns',
    color: '#4A9FD8',
    gradient: 'from-[#4A9FD8] to-[#52C9C1]',
  },
  // ... more features
];
```

**Key Features:**
- ✅ 4 cards in grid
- ✅ Gradient icon circles
- ✅ AnimatedOceanCard
- ✅ Staggered animations
- ✅ Scroll reveal
- ✅ Responsive grid (1→2→4)

---

### 4. How It Works Section

```tsx
<section id="how-it-works" className="py-20 px-6 bg-muted/30">
  <div className="mx-auto max-w-7xl">
    <div className="grid gap-8 md:grid-cols-3">
      {steps.map((step, index) => (
        <AnimatedOceanCard delay={index * 0.1}>
          <div className="p-6 text-center">
            {/* Icon with Number Badge */}
            <div className="relative mx-auto mb-6 inline-block">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${step.color}40, ${step.color}20)`,
                }}
              >
                <step.icon className="h-10 w-10" style={{ color: step.color }} />
              </div>
              
              {/* Number Badge */}
              <div
                className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{
                  background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                }}
              >
                <span className="font-bold">{step.step}</span>
              </div>
            </div>
            
            <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        </AnimatedOceanCard>
      ))}
    </div>
  </div>
</section>
```

**Steps Data:**
```tsx
const steps = [
  {
    step: '1',
    title: 'Download and setup',
    description: 'Open in Telegram, complete onboarding in 2 minutes',
    icon: Smartphone,
    color: '#4A9FD8',
  },
  // ... more steps
];
```

**Key Features:**
- ✅ 3 numbered steps
- ✅ Icon with badge overlay
- ✅ Gradient backgrounds
- ✅ Centered layout
- ✅ Each step has unique color

---

### 5. Benefits Section

```tsx
<section className="py-20 px-6">
  <div className="mx-auto max-w-7xl">
    <div className="grid items-center gap-12 lg:grid-cols-2">
      {/* Left: Benefits List */}
      <div>
        <h2 className="mb-6 text-4xl font-bold md:text-5xl">
          Why choose Saturway
        </h2>
        <p className="mb-8 text-xl text-muted-foreground">
          We created a tool that respects your time and energy
        </p>
        
        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 rounded-xl bg-card p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1]">
                <benefit.icon className="h-6 w-6 text-white" />
              </div>
              <span className="font-medium">{benefit.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Visual */}
      <div className="relative">
        <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#4A9FD8]/20 to-[#52C9C1]/20 p-8">
          <div className="flex h-full items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Zap className="h-32 w-32 text-[#4A9FD8]" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

**Benefits Data:**
```tsx
const benefits = [
  { icon: Clock, text: 'Save up to 2 hours a day on planning' },
  { icon: Heart, text: 'Balance between work and life' },
  { icon: TrendingUp, text: '40% more completed tasks' },
  { icon: Shield, text: 'Your data is protected and private' },
];
```

**Key Features:**
- ✅ 2-column layout
- ✅ 4 benefit cards
- ✅ Animated Zap icon
- ✅ Gradient backgrounds
- ✅ Staggered animations

---

### 6. Testimonials Section

```tsx
<section id="testimonials" className="py-20 px-6">
  <div className="mx-auto max-w-7xl">
    <div className="grid gap-8 md:grid-cols-3">
      {testimonials.map((testimonial, index) => (
        <AnimatedOceanCard delay={index * 0.1}>
          <div className="p-6">
            {/* Star Rating */}
            <div className="mb-4 flex gap-1">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#FFD93D] text-[#FFD93D]" />
              ))}
            </div>
            
            {/* Quote */}
            <p className="mb-6 text-muted-foreground">
              "{testimonial.text}"
            </p>
            
            {/* Author */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${testimonial.color}, ${testimonial.color}dd)`,
                }}
              >
                <testimonial.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </div>
          </div>
        </AnimatedOceanCard>
      ))}
    </div>
  </div>
</section>
```

**Testimonials Data:**
```tsx
const testimonials = [
  {
    name: 'Анна Петрова',
    role: 'Product Designer',
    icon: Palette,
    color: '#4A9FD8',
    text: 'Saturway helped me find work-life balance!',
    rating: 5,
  },
  // ... more testimonials
];
```

**Key Features:**
- ✅ 3 cards in grid
- ✅ 5-star ratings
- ✅ Gradient avatar circles
- ✅ Professional icons (Palette, Briefcase, Code)
- ✅ Each has unique ocean color

---

### 7. CTA Section

```tsx
<section className="py-20 px-6">
  <div className="mx-auto max-w-4xl">
    <AnimatedOceanCard>
      <div className="bg-gradient-to-br from-[#4A9FD8]/20 to-[#52C9C1]/20 p-12 text-center">
        <h2 className="mb-4 text-4xl font-bold md:text-5xl">
          Ready to start your journey?
        </h2>
        <p className="mb-8 text-xl text-muted-foreground">
          Join thousands of people who improved their lives
        </p>
        
        {/* Email Form */}
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 rounded-xl border-2 border-border/50 bg-background px-6 py-3"
            required
          />
          <RippleButton type="submit" className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1]">
            Start Free
          </RippleButton>
        </form>
        
        <p className="mt-4 text-sm text-muted-foreground">
          We respect your privacy. No spam.
        </p>
      </div>
    </AnimatedOceanCard>
  </div>
</section>
```

**Key Features:**
- ✅ Email input + submit
- ✅ Gradient card background
- ✅ Privacy notice
- ✅ Centered layout
- ✅ RippleButton submit

---

### 8. Footer

```tsx
<footer className="border-t border-border/50 py-12 px-6">
  <div className="mx-auto max-w-7xl">
    <div className="grid gap-8 md:grid-cols-4">
      {/* Brand */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1]">
            <img src={logoImage} alt="Saturway" />
          </div>
          <span className="text-xl font-bold">Saturway</span>
        </div>
        <p className="text-sm text-muted-foreground">
          AI organizer for mindful productivity
        </p>
      </div>
      
      {/* Product */}
      <div>
        <h4 className="mb-4 font-semibold">Product</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#features">Features</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Roadmap</a></li>
        </ul>
      </div>
      
      {/* Company */}
      <div>
        <h4 className="mb-4 font-semibold">Company</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#">About</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
      
      {/* Legal */}
      <div>
        <h4 className="mb-4 font-semibold">Legal</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
        </ul>
      </div>
    </div>
    
    <div className="mt-12 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
      © 2025 Saturway. All rights reserved.
    </div>
  </div>
</footer>
```

**Key Features:**
- ✅ 4-column layout
- ✅ Brand section with logo
- ✅ Link groups (Product, Company, Legal)
- ✅ Copyright notice
- ✅ Responsive grid

---

## 🎨 Reusable Components

### AnimatedOceanCard

```tsx
// Usage
<AnimatedOceanCard delay={0.1}>
  <div className="p-6">
    {/* Your content */}
  </div>
</AnimatedOceanCard>
```

**Features:**
- Ocean wave animation
- Gradient border
- Hover effects
- Backdrop blur

### RippleButton

```tsx
// Usage
<RippleButton className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1]">
  Click me
</RippleButton>
```

**Features:**
- Ocean ripple effect
- Gradient support
- Touch-friendly
- Accessible

### LanguageToggle

```tsx
// Usage
<LanguageToggle />
```

**Features:**
- RU/EN switcher
- Smooth transition
- Persists choice
- Ocean themed

---

## 📊 Component Props

### Landing Component
```tsx
// No props - uses hooks
const { t, language } = useLanguage();
const { scrollYProgress } = useScroll();
const [email, setEmail] = useState('');
```

### Reusable Components
```tsx
// AnimatedOceanCard
interface Props {
  children: ReactNode;
  delay?: number;
}

// RippleButton
interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

// LanguageToggle
// No props - self-contained
```

---

## 🎯 Usage Tips

1. **Keep ocean colors consistent**
   ```tsx
   // Always use these
   #4A9FD8, #52C9C1, #5AB5E8, #FFD93D
   ```

2. **Use AnimatedOceanCard for all cards**
   ```tsx
   <AnimatedOceanCard delay={index * 0.1}>
   ```

3. **Stagger animations**
   ```tsx
   transition={{ delay: index * 0.1 }}
   ```

4. **Always use translations**
   ```tsx
   {t('landing.section.key')}
   ```

5. **Keep gradients consistent**
   ```tsx
   className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1]"
   ```

---

**Component Guide Complete!** 🎉

For full code, see `/components/Landing.tsx`
