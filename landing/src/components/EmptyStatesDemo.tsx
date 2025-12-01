import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { EmptyState } from './EmptyState';
import { useLanguage } from './LanguageContext';

export function EmptyStatesDemo() {
  const { t } = useLanguage();
  const [activeDemo, setActiveDemo] = useState<'tasks' | 'energy' | 'insights' | 'general'>('tasks');

  const demos = [
    {
      id: 'tasks' as const,
      name: 'Tasks Empty State',
      title: t('tasks.empty'),
      description: t('tasks.emptyDescription'),
      actionLabel: t('tasks.addNew'),
    },
    {
      id: 'energy' as const,
      name: 'Energy Empty State',
      title: t('energy.empty'),
      description: t('energy.emptyDescription'),
      actionLabel: t('energy.logEnergy'),
    },
    {
      id: 'insights' as const,
      name: 'Insights Empty State',
      title: t('insights.emptyTitle'),
      description: t('insights.emptyDescription'),
      actionLabel: t('insights.startTracking'),
    },
    {
      id: 'general' as const,
      name: 'General Empty State',
      title: 'No Activity Yet',
      description: 'Start using Saturway to see your productivity insights and energy patterns',
      actionLabel: 'Get Started',
    },
  ];

  const currentDemo = demos.find(d => d.id === activeDemo)!;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
            Empty States Gallery
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
            Beautiful ocean-themed illustrations for empty states
          </p>
        </div>

        {/* Demo Selector */}
        <Card className="border-[#4A9FD8]/20">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {demos.map((demo) => (
                <Button
                  key={demo.id}
                  variant={activeDemo === demo.id ? 'default' : 'outline'}
                  onClick={() => setActiveDemo(demo.id)}
                  className={
                    activeDemo === demo.id
                      ? 'bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white'
                      : 'border-[#4A9FD8]/30'
                  }
                >
                  {demo.name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Empty State Demo */}
        <EmptyState
          illustration={activeDemo}
          title={currentDemo.title}
          description={currentDemo.description}
          actionLabel={currentDemo.actionLabel}
          onAction={() => alert(`Action triggered for ${currentDemo.name}`)}
          secondaryActionLabel="Learn More"
          onSecondaryAction={() => alert('Secondary action')}
        />

        {/* Features */}
        <Card className="border-[#4A9FD8]/20">
          <div className="p-6">
            <h3 className="mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>
              Features:
            </h3>
            <ul className="space-y-2 text-muted-foreground" style={{ fontSize: '14px' }}>
              <li>✓ Animated ocean-themed illustrations (fish, jellyfish, coral, octopus)</li>
              <li>✓ Smooth Motion animations with spring physics</li>
              <li>✓ Rising bubbles effect in background</li>
              <li>✓ Primary and secondary action buttons</li>
              <li>✓ Fully localized (RU/EN)</li>
              <li>✓ Reusable EmptyState component</li>
              <li>✓ Gradient backgrounds with ocean colors</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
