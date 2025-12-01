import { useState } from 'react';
import { Battery, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { Card } from './ui/card';
import { RippleButton } from './RippleButton';
import { Slider } from './ui/slider';
import { useLanguage } from './LanguageContext';
import { EmptyState } from './EmptyState';

export function EnergyTracker() {
  const { t } = useLanguage();
  const [currentEnergy, setCurrentEnergy] = useState([75]);
  const [hasData, setHasData] = useState(true); // Show data by default

  const weeklyData = [
    { day: t('insights.mon'), energy: 65 },
    { day: t('insights.tue'), energy: 72 },
    { day: t('insights.wed'), energy: 68 },
    { day: t('insights.thu'), energy: 75 },
    { day: t('insights.fri'), energy: 70 },
    { day: t('insights.sat'), energy: 80 },
    { day: t('insights.sun'), energy: 78 },
  ];

  const getEnergyColor = (energy: number) => {
    if (energy >= 80) return 'bg-green-500';
    if (energy >= 60) return 'bg-blue-500';
    if (energy >= 40) return 'bg-yellow-500';
    if (energy >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getEnergyLabel = (energy: number) => {
    if (energy >= 80) return t('energy.levels.veryHigh');
    if (energy >= 60) return t('energy.levels.high');
    if (energy >= 40) return t('energy.levels.medium');
    if (energy >= 20) return t('energy.levels.low');
    return t('energy.levels.veryLow');
  };

  const handleLogEnergy = () => {
    setHasData(true);
  };

  if (!hasData) {
    return (
      <div className="space-y-6">
        <h2 className="mb-6" style={{ fontSize: '24px', fontWeight: 700 }}>
          {t('energy.title')}
        </h2>
        
        <EmptyState
          illustration="energy"
          title={t('energy.empty')}
          description={t('energy.emptyDescription')}
          actionLabel={t('energy.logEnergy')}
          onAction={handleLogEnergy}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="mb-6" style={{ fontSize: '24px', fontWeight: 700 }}>
        {t('energy.title')}
      </h2>

      {/* Current Energy Level */}
      <Card className="border-[#4A9FD8]/20 bg-gradient-to-br from-card to-card/50">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <Battery className="h-6 w-6 text-[#4A9FD8]" />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
              {t('energy.currentLevel')}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '48px', fontWeight: 700 }}>
                {currentEnergy[0]}%
              </span>
              <span
                className="rounded-lg bg-[#4A9FD8]/10 px-4 py-2 text-[#4A9FD8]"
                style={{ fontSize: '16px', fontWeight: 600 }}
              >
                {getEnergyLabel(currentEnergy[0])}
              </span>
            </div>

            <Slider
              value={currentEnergy}
              onValueChange={setCurrentEnergy}
              max={100}
              step={1}
              className="w-full"
            />

            <RippleButton className="w-full bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white hover:opacity-90">
              {t('energy.logEnergy')}
            </RippleButton>
          </div>
        </div>
      </Card>

      {/* Weekly History */}
      <Card className="border-[#4A9FD8]/20">
        <div className="p-6">
          <h3 className="mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>
            {t('energy.history')}
          </h3>
          <div className="flex items-end justify-between gap-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative h-32 w-full">
                  <div
                    className={`absolute bottom-0 w-full rounded-t-lg ${getEnergyColor(day.energy)} transition-all`}
                    style={{ height: `${day.energy}%` }}
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

      {/* Patterns */}
      <Card className="border-[#4A9FD8]/20">
        <div className="p-6">
          <h3 className="mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>
            {t('energy.patterns')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>
                  {t('energy.peakTime')}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                  {t('energy.morning')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <TrendingDown className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>
                  {t('energy.lowTime')}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                  {t('energy.afternoon')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendation */}
      <Card className="border-[#4A9FD8]/20 bg-gradient-to-br from-[#FFD93D]/5 to-transparent">
        <div className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#FFD93D]" />
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
              {t('energy.recommendation')}
            </h3>
          </div>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            {t('energy.recommendationText')}
          </p>
        </div>
      </Card>
    </div>
  );
}