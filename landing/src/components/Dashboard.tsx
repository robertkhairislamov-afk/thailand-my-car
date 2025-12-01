import { Brain, Zap, Target, TrendingUp, Plus, Activity, Lightbulb, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { RippleButton } from './RippleButton';
import { AnimatedCard, StaggerContainer, staggerItemVariants, FadeIn } from './AnimatedScreen';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { GradientHeader } from './GradientHeader';
import { AnimatedOceanCard } from './AnimatedOceanCard';

interface DashboardProps {
  userName: string;
}

export function Dashboard({ userName }: DashboardProps) {
  const { t } = useLanguage();

  const stats = [
    {
      label: t('dashboard.tasksToday'),
      completed: 12,
      total: 18,
      percentage: 67,
      icon: Target,
      color: 'text-[#4A9FD8]',
      bgColor: 'bg-[#4A9FD8]/10',
    },
    {
      label: t('dashboard.energyLevel'),
      value: '78%',
      percentage: 78,
      icon: Zap,
      color: 'text-[#52C9C1]',
      bgColor: 'bg-[#52C9C1]/10',
    },
  ];

  const recentTasks = [
    { id: 1, text: 'Complete project proposal', completed: true },
    { id: 2, text: 'Review design mockups', completed: true },
    { id: 3, text: 'Team meeting at 3 PM', completed: false },
    { id: 4, text: 'Update documentation', completed: false },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section with Gradient Header */}
      <GradientHeader
        title={`${t('dashboard.greeting')}, ${userName}!`}
        subtitle={t('dashboard.subtitle')}
        variant="ocean"
      />

      {/* Stats Grid with Ocean Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <AnimatedOceanCard key={index} delay={index * 0.1}>
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <motion.div 
                    className={`rounded-lg ${stat.bgColor} p-3`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 700 }}>
                    {'completed' in stat ? `${stat.completed}/${stat.total}` : stat.value}
                  </p>
                  <Progress value={stat.percentage} className="h-2" />
                  <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                    {'completed' in stat 
                      ? `${stat.completed} ${t('dashboard.completed')}, ${stat.total - stat.completed} ${t('dashboard.pending')}`
                      : `${t('dashboard.currentEnergy')}`
                    }
                  </p>
                </div>
              </div>
            </AnimatedOceanCard>
          );
        })}
      </div>

      {/* AI Tip with Ocean Card */}
      <AnimatedOceanCard delay={0.2}>
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <motion.div 
              className="rounded-lg bg-[#FFD93D]/10 p-2"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Lightbulb className="h-5 w-5 text-[#FFD93D]" />
            </motion.div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
              {t('dashboard.aiTip')}
            </h3>
          </div>
          <div className="space-y-2">
            <p style={{ fontSize: '16px', fontWeight: 600 }}>
              {t('dashboard.tipTitle')}
            </p>
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              {t('dashboard.tipContent')}
            </p>
          </div>
        </div>
      </AnimatedOceanCard>

      {/* Quick Actions */}
      <div>
        <motion.h3 
          className="mb-4" 
          style={{ fontSize: '18px', fontWeight: 600 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {t('dashboard.quickActions')}
        </motion.h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <RippleButton
            variant="outline"
            className="h-auto justify-start gap-3 border-[#4A9FD8]/30 p-4 hover:bg-[#4A9FD8]/5"
          >
            <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
              <Plus className="h-5 w-5 text-[#4A9FD8]" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('dashboard.addTask')}
            </span>
          </RippleButton>
          
          <RippleButton
            variant="outline"
            className="h-auto justify-start gap-3 border-[#52C9C1]/30 p-4 hover:bg-[#52C9C1]/5"
          >
            <div className="rounded-lg bg-[#52C9C1]/10 p-2">
              <Activity className="h-5 w-5 text-[#52C9C1]" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('dashboard.trackEnergy')}
            </span>
          </RippleButton>
          
          <RippleButton
            variant="outline"
            className="h-auto justify-start gap-3 border-[#5AB5E8]/30 p-4 hover:bg-[#5AB5E8]/5"
          >
            <div className="rounded-lg bg-[#5AB5E8]/10 p-2">
              <Brain className="h-5 w-5 text-[#5AB5E8]" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {t('dashboard.viewInsights')}
            </span>
          </RippleButton>
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <motion.h3 
            style={{ fontSize: '18px', fontWeight: 600 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t('dashboard.recentTasks')}
          </motion.h3>
          <RippleButton variant="ghost" size="sm" className="text-[#4A9FD8]">
            {t('dashboard.viewAll')}
            <ChevronRight className="ml-1 h-4 w-4" />
          </RippleButton>
        </div>
        <AnimatedOceanCard delay={0.5}>
          <div className="divide-y divide-border/50">
            {recentTasks.map((task, index) => (
              <motion.div
                key={task.id}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
              >
                <div
                  className={`h-5 w-5 rounded-full border-2 ${
                    task.completed
                      ? 'border-[#4A9FD8] bg-[#4A9FD8]'
                      : 'border-muted-foreground'
                  }`}
                >
                  {task.completed && (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <span
                  className={task.completed ? 'text-muted-foreground line-through' : ''}
                  style={{ fontSize: '14px' }}
                >
                  {task.text}
                </span>
              </motion.div>
            ))}
          </div>
        </AnimatedOceanCard>
      </div>
    </div>
  );
}