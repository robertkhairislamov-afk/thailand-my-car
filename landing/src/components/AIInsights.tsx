import { Brain, TrendingUp, Zap, Target, Clock, Lightbulb } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { useLanguage } from './LanguageContext';
import { EmptyState } from './EmptyState';
import { useState } from 'react';

export function AIInsights() {
  const { t } = useLanguage();
  const [hasData, setHasData] = useState(true); // Show data by default

  const weeklyData = [
    { day: t('insights.mon'), tasks: 8 },
    { day: t('insights.tue'), tasks: 12 },
    { day: t('insights.wed'), tasks: 10 },
    { day: t('insights.thu'), tasks: 15 },
    { day: t('insights.fri'), tasks: 11 },
    { day: t('insights.sat'), tasks: 6 },
    { day: t('insights.sun'), tasks: 4 },
  ];

  const maxTasks = Math.max(...weeklyData.map(d => d.tasks));

  const suggestions = [
    {
      icon: Clock,
      title: t('insights.suggestion1Title'),
      description: t('insights.suggestion1Text'),
      color: 'text-[#4A9FD8]',
      bgColor: 'bg-[#4A9FD8]/10',
    },
    {
      icon: Zap,
      title: t('insights.suggestion2Title'),
      description: t('insights.suggestion2Text'),
      color: 'text-[#52C9C1]',
      bgColor: 'bg-[#52C9C1]/10',
    },
    {
      icon: Target,
      title: t('insights.suggestion3Title'),
      description: t('insights.suggestion3Text'),
      color: 'text-[#5AB5E8]',
      bgColor: 'bg-[#5AB5E8]/10',
    },
  ];

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-[#4A9FD8]" />
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
            {t('insights.title')}
          </h2>
        </div>

        <EmptyState
          illustration="insights"
          title={t('insights.emptyTitle')}
          description={t('insights.emptyDescription')}
          actionLabel={t('insights.startTracking')}
          onAction={() => setHasData(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="h-7 w-7 text-[#4A9FD8]" />
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
          {t('insights.title')}
        </h2>
      </div>

      {/* Productivity Overview */}
      <Card className="border-[#4A9FD8]/20 bg-gradient-to-br from-card to-card/50">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="mb-1" style={{ fontSize: '18px', fontWeight: 600 }}>
                {t('insights.productivity')}
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                {t('insights.thisWeek')}
              </p>
            </div>
            <div className="text-right">
              <p style={{ fontSize: '36px', fontWeight: 700 }}>66</p>
              <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                {t('insights.tasksCompleted')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500" style={{ fontSize: '14px', fontWeight: 500 }}>
              +12% {t('insights.comparedToLast')}
            </span>
          </div>
        </div>
      </Card>

      {/* Weekly Progress Chart */}
      <Card className="border-[#4A9FD8]/20">
        <div className="p-6">
          <h3 className="mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>
            {t('insights.weeklyProgress')}
          </h3>
          <div className="flex items-end justify-between gap-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  {day.tasks}
                </span>
                <div className="relative h-32 w-full">
                  <div
                    className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-[#4A9FD8] to-[#52C9C1] transition-all"
                    style={{ height: `${(day.tasks / maxTasks) * 100}%` }}
                  />
                </div>
                <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-[#4A9FD8]/20">
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
                <Zap className="h-5 w-5 text-[#4A9FD8]" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                {t('insights.energyCorrelation')}
              </h3>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              {t('insights.correlationText')}
            </p>
          </div>
        </Card>

        <Card className="border-[#4A9FD8]/20">
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-[#52C9C1]/10 p-2">
                <Clock className="h-5 w-5 text-[#52C9C1]" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                {t('insights.bestTime')}
              </h3>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              {t('insights.bestTimeText')}
            </p>
          </div>
        </Card>
      </div>

      {/* AI Suggestions */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[#FFD93D]" />
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
            {t('insights.suggestions')}
          </h3>
        </div>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <Card
                key={index}
                className="border-[#4A9FD8]/20 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4 p-4">
                  <div className={`rounded-lg ${suggestion.bgColor} p-3`}>
                    <Icon className={`h-5 w-5 ${suggestion.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1" style={{ fontSize: '15px', fontWeight: 600 }}>
                      {suggestion.title}
                    </h4>
                    <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}