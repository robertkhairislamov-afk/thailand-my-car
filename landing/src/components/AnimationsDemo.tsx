import { Card } from './ui/card';
import { RippleButton } from './RippleButton';
import { AnimatedCard, StaggerContainer, FadeIn, SlideIn, ScaleIn } from './AnimatedScreen';
import { motion } from 'motion/react';
import { Zap, Heart, Star, TrendingUp, CheckCircle2 } from 'lucide-react';

export function AnimationsDemo() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-2" style={{ fontSize: '32px', fontWeight: 700 }}>
            Animations & Transitions Demo
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
            Smooth ocean-themed animations and transitions
          </p>
        </div>

        {/* Ripple Buttons */}
        <section>
          <h2 className="mb-4" style={{ fontSize: '24px', fontWeight: 600 }}>
            Ripple Effect Buttons
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <RippleButton className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white">
              Primary Button
            </RippleButton>
            <RippleButton variant="outline" className="border-[#4A9FD8]/30">
              Outline Button
            </RippleButton>
            <RippleButton variant="secondary">
              Secondary Button
            </RippleButton>
          </div>
        </section>

        {/* Animated Cards */}
        <section>
          <h2 className="mb-4" style={{ fontSize: '24px', fontWeight: 600 }}>
            Animated Cards (Staggered Entry)
          </h2>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Zap, title: 'Energy', color: 'text-[#52C9C1]', bg: 'bg-[#52C9C1]/10' },
              { icon: Heart, title: 'Health', color: 'text-red-500', bg: 'bg-red-500/10' },
              { icon: Star, title: 'Focus', color: 'text-[#FFD93D]', bg: 'bg-[#FFD93D]/10' },
              { icon: TrendingUp, title: 'Growth', color: 'text-green-500', bg: 'bg-green-500/10' },
            ].map((item, i) => (
              <motion.div key={i} variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}>
                <Card className="border-[#4A9FD8]/20 transition-all hover:shadow-md">
                  <div className="p-6">
                    <div className={`mb-4 inline-flex rounded-lg ${item.bg} p-3`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{item.title}</h3>
                    <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                      Hover to see the lift effect
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </StaggerContainer>
        </section>

        {/* Fade In */}
        <section>
          <h2 className="mb-4" style={{ fontSize: '24px', fontWeight: 600 }}>
            Fade In Animation
          </h2>
          <FadeIn delay={0.2}>
            <Card className="border-[#4A9FD8]/20 bg-gradient-to-br from-card to-card/50">
              <div className="p-6">
                <p style={{ fontSize: '16px' }}>
                  This card fades in smoothly when the component mounts
                </p>
              </div>
            </Card>
          </FadeIn>
        </section>

        {/* Slide In */}
        <section>
          <h2 className="mb-4" style={{ fontSize: '24px', fontWeight: 600 }}>
            Slide In Animations
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SlideIn direction="left">
              <Card className="border-[#4A9FD8]/20">
                <div className="p-6">
                  <p style={{ fontSize: '14px' }}>Slides from left</p>
                </div>
              </Card>
            </SlideIn>
            <SlideIn direction="right">
              <Card className="border-[#4A9FD8]/20">
                <div className="p-6">
                  <p style={{ fontSize: '14px' }}>Slides from right</p>
                </div>
              </Card>
            </SlideIn>
          </div>
        </section>

        {/* Scale In */}
        <section>
          <h2 className="mb-4" style={{ fontSize: '24px', fontWeight: 600 }}>
            Scale In Animation
          </h2>
          <ScaleIn delay={0.3}>
            <Card className="border-[#4A9FD8]/20 bg-gradient-to-br from-[#4A9FD8]/5 to-transparent">
              <div className="p-6 text-center">
                <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1]">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Scaled Entry</h3>
                <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                  Pops in with a spring animation
                </p>
              </div>
            </Card>
          </ScaleIn>
        </section>

        {/* Continuous Animations */}
        <section>
          <h2 className="mb-4" style={{ fontSize: '24px', fontWeight: 600 }}>
            Continuous Animations
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Pulse */}
            <Card className="border-[#4A9FD8]/20">
              <div className="p-6 text-center">
                <motion.div
                  className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1]"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <p style={{ fontSize: '14px', fontWeight: 500 }}>Pulse</p>
              </div>
            </Card>

            {/* Float */}
            <Card className="border-[#4A9FD8]/20">
              <div className="p-6 text-center">
                <motion.div
                  className="mx-auto mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-[#52C9C1] to-[#5AB5E8]"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <p style={{ fontSize: '14px', fontWeight: 500 }}>Float</p>
              </div>
            </Card>

            {/* Rotate */}
            <Card className="border-[#4A9FD8]/20">
              <div className="p-6 text-center">
                <motion.div
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#5AB5E8] to-[#FFD93D]"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Star className="h-8 w-8 text-white" />
                </motion.div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>Rotate</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Hover Effects */}
        <section>
          <h2 className="mb-4" style={{ fontSize: '24px', fontWeight: 600 }}>
            Enhanced Hover Effects
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Lift */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-[#4A9FD8]/20 cursor-pointer">
                <div className="p-6 text-center">
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>Hover Lift</p>
                  <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                    Lifts on hover
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Glow */}
            <motion.div
              whileHover={{ boxShadow: "0 0 20px rgba(74, 159, 216, 0.3)" }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-[#4A9FD8]/20 cursor-pointer">
                <div className="p-6 text-center">
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>Hover Glow</p>
                  <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                    Glows on hover
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Scale */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-[#4A9FD8]/20 cursor-pointer">
                <div className="p-6 text-center">
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>Hover Scale</p>
                  <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                    Scales on hover/tap
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Success Message */}
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-transparent">
          <div className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-3"
            >
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </motion.div>
              </div>
            </motion.div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="text-green-600">
              All Animations Working!
            </h3>
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              Smooth transitions, ripple effects, and ocean-themed animations ready
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
