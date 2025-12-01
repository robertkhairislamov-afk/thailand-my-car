import { useState } from 'react';
import { User, Bell, Globe, Trash2, Languages } from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { RippleButton } from './RippleButton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { useLanguage } from './LanguageContext';
import { LanguageToggleDark } from './LanguageToggle';
import { AnimatedOceanCard } from './AnimatedOceanCard';

interface ProfileScreenProps {
  userName?: string;
}

export function ProfileScreen({ userName = 'Alex' }: ProfileScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReview, setEveningReview] = useState(true);

  const handleDeleteData = () => {
    // В реальном приложении здесь будет запрос к API для удаления данных
    console.log('Delete user data');
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Profile Card */}
      <AnimatedOceanCard delay={0.1}>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-[#4A9FD8]">
              <AvatarFallback className="bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1] text-white" style={{ fontSize: '32px', fontWeight: 600 }}>
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: 600 }}>{userName}</h3>
              <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                {t('profile.member')}
              </p>
            </div>
          </div>
        </div>
      </AnimatedOceanCard>

      {/* Language Settings */}
      <AnimatedOceanCard delay={0.15}>
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
                <Languages className="h-5 w-5 text-[#4A9FD8]" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
                {t('profile.language')}
              </h3>
            </div>
            <LanguageToggleDark currentLanguage={language} onToggle={setLanguage} />
          </div>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            {t('profile.languageDesc')}
          </p>
        </div>
      </AnimatedOceanCard>

      {/* Reminders Settings */}
      <AnimatedOceanCard delay={0.2}>
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
              <Bell className="h-5 w-5 text-[#4A9FD8]" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
              {t('profile.reminders')}
            </h3>
          </div>

          <div className="space-y-4">
            {/* Morning Reminder */}
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>
                  {t('profile.morningPlan')}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  {t('profile.morningPlanTime')}
                </p>
              </div>
              <Switch
                checked={morningReminder}
                onCheckedChange={setMorningReminder}
                className="data-[state=checked]:bg-[#4A9FD8]"
              />
            </div>

            <Separator />

            {/* Evening Review */}
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>
                  {t('profile.eveningReview')}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  {t('profile.eveningReviewTime')}
                </p>
              </div>
              <Switch
                checked={eveningReview}
                onCheckedChange={setEveningReview}
                className="data-[state=checked]:bg-[#4A9FD8]"
              />
            </div>
          </div>
        </div>
      </AnimatedOceanCard>

      {/* About Section */}
      <AnimatedOceanCard delay={0.25}>
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
              <Globe className="h-5 w-5 text-[#4A9FD8]" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
              {t('profile.about')}
            </h3>
          </div>
          <div className="space-y-2 text-muted-foreground" style={{ fontSize: '14px' }}>
            <p>{t('profile.version')}</p>
            <p>{t('profile.tagline')}</p>
          </div>
        </div>
      </AnimatedOceanCard>

      {/* Delete Data Section */}
      <AnimatedOceanCard delay={0.3}>
        <div className="p-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <RippleButton
                variant="outline"
                className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                {t('profile.deleteData')}
              </RippleButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('profile.deleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('profile.deleteConfirmDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('profile.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteData}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {t('profile.deleteConfirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AnimatedOceanCard>
    </div>
  );
}
