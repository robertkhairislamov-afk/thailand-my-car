import { useState } from 'react';
import { Waves, Sparkles, Droplets, CircleDot, ArrowLeft } from 'lucide-react';
import { RippleButton } from './RippleButton';
import { Card } from './ui/card';
import { FloatingBubbles } from './FloatingBubbles';
import { GradientHeader } from './GradientHeader';
import { AnimatedOceanCard } from './AnimatedOceanCard';
import { OceanAccents } from './OceanAccents';
import { motion } from 'motion/react';

export function OceanAccentsDemo() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const demos = [
    {
      id: 'bubbles',
      title: 'Floating Bubbles',
      description: 'Subtle animated bubbles that float upward',
      icon: Droplets,
      color: '#4A9FD8',
    },
    {
      id: 'gradient-headers',
      title: 'Gradient Headers',
      description: 'Beautiful ocean-themed gradient headers',
      icon: Waves,
      color: '#52C9C1',
    },
    {
      id: 'ocean-cards',
      title: 'Ocean Cards',
      description: 'Animated cards with wave effects',
      icon: Sparkles,
      color: '#5AB5E8',
    },
    {
      id: 'accents',
      title: 'Ocean Accents',
      description: 'Background orbs and ripple effects',
      icon: CircleDot,
      color: '#4ECDC4',
    },
  ];

  if (activeDemo === 'bubbles') {
    return (
      <div className="relative min-h-screen space-y-6 p-6">
        <FloatingBubbles count={15} opacity={0.2} />
        
        <RippleButton
          variant="outline"
          onClick={() => setActiveDemo(null)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </RippleButton>

        <div className="relative z-10 space-y-6">
          <h2 style={{ fontSize: '28px', fontWeight: 700 }}>Floating Bubbles Demo</h2>
          
          <Card className="border-[#4A9FD8]/20 p-6">
            <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-4">
              Different Configurations
            </h3>
            
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl border-2 border-[#4A9FD8]/30 bg-gradient-to-br from-[#4A9FD8]/10 to-[#52C9C1]/10 p-8">
                <FloatingBubbles count={8} minSize={15} maxSize={35} opacity={0.15} />
                <p className="relative z-10">Default - 8 bubbles, subtle opacity</p>
              </div>

              <div className="relative overflow-hidden rounded-xl border-2 border-[#52C9C1]/30 bg-gradient-to-br from-[#52C9C1]/10 to-[#5AB5E8]/10 p-8">
                <FloatingBubbles count={12} minSize={20} maxSize={40} opacity={0.25} />
                <p className="relative z-10">More bubbles - 12 bubbles, higher opacity</p>
              </div>

              <div className="relative overflow-hidden rounded-xl border-2 border-[#5AB5E8]/30 bg-gradient-to-br from-[#5AB5E8]/10 to-[#4A9FD8]/10 p-8">
                <FloatingBubbles count={5} minSize={25} maxSize={50} opacity={0.2} />
                <p className="relative z-10">Large bubbles - 5 bubbles, larger sizes</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (activeDemo === 'gradient-headers') {
    return (
      <div className="space-y-6 p-6">
        <RippleButton
          variant="outline"
          onClick={() => setActiveDemo(null)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </RippleButton>

        <h2 style={{ fontSize: '28px', fontWeight: 700 }}>Gradient Headers Demo</h2>

        <div className="space-y-4">
          <GradientHeader
            title="Ocean Variant"
            subtitle="Default ocean gradient with decorative elements"
            icon={<Waves className="h-6 w-6" />}
            variant="ocean"
          />

          <GradientHeader
            title="Sky Variant"
            subtitle="Lighter sky-themed gradient"
            icon={<Sparkles className="h-6 w-6" />}
            variant="sky"
          />

          <GradientHeader
            title="Turquoise Variant"
            subtitle="Turquoise-focused gradient"
            icon={<Droplets className="h-6 w-6" />}
            variant="turquoise"
          />

          <GradientHeader
            title="Minimal Header"
            subtitle="Without decorative elements"
            variant="ocean"
            showDecoration={false}
          />

          <GradientHeader
            title="Simple Header"
            variant="sky"
            showDecoration={false}
          />
        </div>
      </div>
    );
  }

  if (activeDemo === 'ocean-cards') {
    return (
      <div className="space-y-6 p-6">
        <RippleButton
          variant="outline"
          onClick={() => setActiveDemo(null)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </RippleButton>

        <h2 style={{ fontSize: '28px', fontWeight: 700 }}>Ocean Cards Demo</h2>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatedOceanCard delay={0}>
              <div className="p-6">
                <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
                  With Waves & Glow
                </h3>
                <p className="text-muted-foreground">
                  Hover to see wave animation and glow effect
                </p>
              </div>
            </AnimatedOceanCard>

            <AnimatedOceanCard delay={0.1} showWaves={false}>
              <div className="p-6">
                <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
                  Only Glow Effect
                </h3>
                <p className="text-muted-foreground">
                  Waves disabled, glow on hover
                </p>
              </div>
            </AnimatedOceanCard>

            <AnimatedOceanCard delay={0.2} showGlow={false}>
              <div className="p-6">
                <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
                  Only Wave Effect
                </h3>
                <p className="text-muted-foreground">
                  Glow disabled, waves on hover
                </p>
              </div>
            </AnimatedOceanCard>

            <AnimatedOceanCard delay={0.3} showWaves={false} showGlow={false}>
              <div className="p-6">
                <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
                  Minimal Card
                </h3>
                <p className="text-muted-foreground">
                  No special effects, just animation
                </p>
              </div>
            </AnimatedOceanCard>
          </div>

          <div className="space-y-2">
            {['First Card', 'Second Card', 'Third Card'].map((title, index) => (
              <AnimatedOceanCard key={index} delay={index * 0.05}>
                <div className="p-4">
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{title}</p>
                  <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                    Staggered animation with {index * 0.05}s delay
                  </p>
                </div>
              </AnimatedOceanCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeDemo === 'accents') {
    return (
      <div className="space-y-6 p-6">
        <RippleButton
          variant="outline"
          onClick={() => setActiveDemo(null)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </RippleButton>

        <h2 style={{ fontSize: '28px', fontWeight: 700 }}>Ocean Accents Demo</h2>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border-2 border-[#4A9FD8]/30 bg-card p-8">
            <OceanAccents variant="subtle" />
            <div className="relative z-10">
              <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
                Subtle Variant
              </h3>
              <p className="text-muted-foreground">
                Very light background orbs and ripples - perfect for main app background
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border-2 border-[#52C9C1]/30 bg-card p-8">
            <OceanAccents variant="medium" />
            <div className="relative z-10">
              <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
                Medium Variant
              </h3>
              <p className="text-muted-foreground">
                More visible effects - good for specific sections
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border-2 border-[#5AB5E8]/30 bg-card p-8">
            <OceanAccents variant="vibrant" />
            <div className="relative z-10">
              <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
                Vibrant Variant
              </h3>
              <p className="text-muted-foreground">
                Most visible effects - for hero sections or special areas
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border-2 border-[#4ECDC4]/30 bg-card p-8">
            <OceanAccents variant="medium" showRipples={false} />
            <div className="relative z-10">
              <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
                Without Ripples
              </h3>
              <p className="text-muted-foreground">
                Only gradient orbs, no ripple effects
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border-2 border-[#4A9FD8]/30 bg-card p-8">
            <OceanAccents variant="medium" showGradientOrbs={false} />
            <div className="relative z-10">
              <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
                Without Gradient Orbs
              </h3>
              <p className="text-muted-foreground">
                Only ripples and light beams, no gradient orbs
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }} className="mb-2">
          Ocean Accents Demo
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
          Explore all the ocean-themed visual enhancements
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {demos.map((demo, index) => {
          const Icon = demo.icon;
          return (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer border-[#4A9FD8]/20 transition-all hover:shadow-lg"
                onClick={() => setActiveDemo(demo.id)}
              >
                <div className="p-6">
                  <div
                    className="mb-4 inline-flex rounded-lg p-3"
                    style={{ backgroundColor: `${demo.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: demo.color }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
                    {demo.title}
                  </h3>
                  <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                    {demo.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="border-[#4A9FD8]/20 bg-gradient-to-br from-[#4A9FD8]/5 to-[#52C9C1]/5 p-6">
        <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">
          💡 Usage Tips
        </h3>
        <ul className="space-y-2 text-muted-foreground" style={{ fontSize: '14px' }}>
          <li>• <strong>FloatingBubbles:</strong> Use on main background with low opacity (0.12-0.15)</li>
          <li>• <strong>GradientHeader:</strong> Perfect for section headers and hero sections</li>
          <li>• <strong>AnimatedOceanCard:</strong> Use for cards that need subtle hover effects</li>
          <li>• <strong>OceanAccents:</strong> Add as background layer with "subtle" variant for main app</li>
        </ul>
      </Card>
    </div>
  );
}
