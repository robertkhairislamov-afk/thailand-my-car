import { useState } from 'react';
import {
  User,
  Globe,
  Shield,
  Info,
  FileText,
  ChevronRight,
  Mail,
  Lock,
  Languages,
  Eye,
  EyeOff,
  Palette,
} from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RippleButton } from './RippleButton';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { LanguageToggleDark } from './LanguageToggle';
import { useLanguage } from './LanguageContext';
import { useBackground } from './BackgroundContext';

export function Settings() {
  const { language: contextLanguage, setLanguage: setContextLanguage, t } = useLanguage();
  const { background: contextBackground, setBackground: setContextBackground } = useBackground();
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState('Alex');
  const [email, setEmail] = useState('alex@example.com');
  const [bio, setBio] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  return (
    <div className="space-y-6 pb-6">
      {/* Profile Section */}
      <Card className="border-[#4A9FD8]/20 bg-gradient-to-br from-card to-card/50">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-[#4A9FD8]">
              <AvatarFallback className="bg-gradient-to-br from-[#4A9FD8] to-[#52C9C1] text-white">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 600 }}>{userName}</h3>
              <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                {email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#4A9FD8]" />
                {t('settings.username')}
              </Label>
              <Input
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="border-[#4A9FD8]/30 focus-visible:ring-[#4A9FD8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#4A9FD8]" />
                {t('settings.email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#4A9FD8]/30 focus-visible:ring-[#4A9FD8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#4A9FD8]" />
                {t('settings.password')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="border-[#4A9FD8]/30 pr-10 focus-visible:ring-[#4A9FD8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#4A9FD8]" />
                {t('settings.aboutMe')}
              </Label>
              <Textarea
                id="bio"
                placeholder={t('settings.aboutMePlaceholder')}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px] resize-none border-[#4A9FD8]/30 focus-visible:ring-[#4A9FD8]"
              />
            </div>

            <RippleButton className="w-full bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white hover:opacity-90">
              {t('settings.saveProfile')}
            </RippleButton>
          </div>
        </div>
      </Card>

      {/* Language Settings */}
      <Card className="border-[#4A9FD8]/20">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
                <Languages className="h-5 w-5 text-[#4A9FD8]" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{t('settings.language')}</h3>
            </div>
            <LanguageToggleDark
              currentLanguage={contextLanguage}
              onToggle={setContextLanguage}
            />
          </div>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            {t('settings.languageDescription')}
          </p>
        </div>
      </Card>

      {/* Background Settings */}
      <Card className="border-[#4A9FD8]/20">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
              <Palette className="h-5 w-5 text-[#4A9FD8]" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{t('settings.background')}</h3>
          </div>
          <p className="mb-4 text-muted-foreground" style={{ fontSize: '14px' }}>
            {t('settings.backgroundDescription')}
          </p>
          <Select
            value={contextBackground}
            onValueChange={setContextBackground}
          >
            <SelectTrigger className="border-[#4A9FD8]/30 focus:ring-[#4A9FD8]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ocean-accents">{t('settings.bgOceanAccents')}</SelectItem>
              <SelectItem value="caustics">{t('settings.bgCaustics')}</SelectItem>
              <SelectItem value="waves">{t('settings.bgWaves')}</SelectItem>
              <SelectItem value="depth-layers">{t('settings.bgDepthLayers')}</SelectItem>
              <SelectItem value="mesh-grid">{t('settings.bgMeshGrid')}</SelectItem>
              <SelectItem value="minimal">{t('settings.bgMinimal')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="border-[#4A9FD8]/20">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
              <Shield className="h-5 w-5 text-[#4A9FD8]" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{t('settings.privacy')}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>
                  {t('settings.notifications')}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  {t('settings.notificationsDesc')}
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
                className="data-[state=checked]:bg-[#4A9FD8]"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{t('settings.dataSharing')}</p>
                <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  {t('settings.dataSharingDesc')}
                </p>
              </div>
              <Switch
                checked={dataSharing}
                onCheckedChange={setDataSharing}
                className="data-[state=checked]:bg-[#4A9FD8]"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* About & Legal */}
      <Card className="border-[#4A9FD8]/20">
        <div className="p-6 space-y-3">
          {/* About Author */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-[#4A9FD8]/5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
                    <Info className="h-5 w-5 text-[#4A9FD8]" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    {t('settings.aboutAuthor')}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('settings.aboutAuthorTitle')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p style={{ fontSize: '14px' }}>
                  {t('settings.aboutAuthorText1')}
                </p>
                <p style={{ fontSize: '14px' }}>
                  {t('settings.aboutAuthorText2')}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                  {t('settings.version')}
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <Separator />

          {/* Privacy Policy */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-[#4A9FD8]/5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
                    <Shield className="h-5 w-5 text-[#4A9FD8]" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    {t('settings.privacyPolicy')}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('settings.privacyPolicyTitle')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-left">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }} className="mb-2">
                    {t('settings.dataCollection')}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    {t('settings.dataCollectionText')}
                  </p>
                </div>
                
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }} className="mb-2">
                    {t('settings.dataSecurity')}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    {t('settings.dataSecurityText')}
                  </p>
                </div>
                
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }} className="mb-2">
                    {t('settings.yourRights')}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    {t('settings.yourRightsText')}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Separator />

          {/* Terms of Service */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-[#4A9FD8]/5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
                    <FileText className="h-5 w-5 text-[#4A9FD8]" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    {t('settings.termsOfService')}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('settings.termsOfServiceTitle')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-left">
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }} className="mb-2">
                    {t('settings.acceptanceOfTerms')}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    {t('settings.acceptanceOfTermsText')}
                  </p>
                </div>
                
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }} className="mb-2">
                    {t('settings.license')}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    {t('settings.licenseText')}
                  </p>
                </div>
                
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }} className="mb-2">
                    {t('settings.prohibitedUses')}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    {t('settings.prohibitedUsesText')}
                  </p>
                </div>
                
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }} className="mb-2">
                    {t('settings.changesToTerms')}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    {t('settings.changesToTermsText')}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Separator />

          {/* Copyright */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-[#4A9FD8]/5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#4A9FD8]/10 p-2">
                    <Globe className="h-5 w-5 text-[#4A9FD8]" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    {t('settings.copyright')}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('settings.copyrightTitle')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-left">
                <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                  {t('settings.copyrightText1')}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                  {t('settings.copyrightText2')}
                </p>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }} className="mb-2">
                    {t('settings.openSourceLibraries')}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '13px' }}>
                    {t('settings.openSourceLibrariesText')}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* App Version */}
      <div className="text-center text-muted-foreground" style={{ fontSize: '12px' }}>
        <p>{t('settings.appVersion')}</p>
        <p>{t('settings.appTagline')}</p>
      </div>
    </div>
  );
}