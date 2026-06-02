'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Palette,
  Code2,
  Shield,
  AlertTriangle,
  Check,
} from 'lucide-react';
import type { Locale } from '@/i18n/routing';

interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
}

interface AppSettings {
  defaultEditorLanguage: string;
}

function getFromLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return fallback;
}

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const locale = useLocale() as Locale;
  const { data: session } = useSession();

  const getUserDisplayName = () => {
    if (!session?.user) return 'Algora User';
    return session.user.name || session.user.email?.split('@')[0] || 'User';
  };

  const [displayName, setDisplayName] = useState(getUserDisplayName);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(
    () => getFromLocalStorage('algora-editor-settings', { fontSize: 14, tabSize: 4, wordWrap: true })
  );
  const [appSettings, setAppSettings] = useState<AppSettings>(
    () => getFromLocalStorage('algora-app-settings', { defaultEditorLanguage: 'python' })
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveEditorSettings = () => {
    localStorage.setItem('algora-editor-settings', JSON.stringify(editorSettings));
    localStorage.setItem('algora-app-settings', JSON.stringify(appSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };
  const [deleteProgress, setDeleteProgress] = useState(false);

  const sectionCard = 'bg-algora-card-bg rounded-xl border border-[rgba(255,255,255,0.08)] p-6 opacity-0 animate-fade-in-up';

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D12]">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0s', animationFillMode: 'forwards' }}>
            <h1 className="text-2xl md:text-3xl font-bold text-algora-text-primary mb-2">
              {t('title')}
            </h1>
          </div>

          <div className="space-y-6">
            {/* Account Section */}
            <section className={sectionCard} style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-algora-gold/10 border border-algora-gold/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-algora-gold" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-algora-text-primary">
                    {t('accountSection')}
                  </h2>
                  <p className="text-sm text-algora-text-dim">
                    {t('accountSectionDesc')}
                  </p>
                </div>
              </div>

              <Separator className="my-5 bg-[rgba(255,255,255,0.06)]" />

              <div className="space-y-4">
                {/* Display Name */}
                <div className="space-y-2">
                  <Label className="text-sm text-algora-text-muted">{t('displayName')}</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary focus:border-algora-gold focus:ring-algora-gold/20 focus:outline-none rounded-lg h-10"
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label className="text-sm text-algora-text-muted">{t('email')}</Label>
                  <Input
                    value={session?.user?.email || 'user@algora.dev'}
                    readOnly
                    className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-algora-text-dim rounded-lg h-10 cursor-not-allowed"
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <p className="text-xs text-algora-text-dim">{t('emailReadOnly')}</p>
                </div>
              </div>
            </section>

            {/* Preferences Section */}
            <section className={sectionCard} style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-algora-purple/10 border border-algora-purple/20 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-algora-purple" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-algora-text-primary">
                    {t('preferencesSection')}
                  </h2>
                  <p className="text-sm text-algora-text-dim">
                    {t('preferencesSectionDesc')}
                  </p>
                </div>
              </div>

              <Separator className="my-5 bg-[rgba(255,255,255,0.06)]" />

              <div className="space-y-4">
                {/* Default Editor Language */}
                <div className="space-y-2">
                  <Label className="text-sm text-algora-text-muted">{t('defaultEditorLanguage')}</Label>
                  <Select
                    value={appSettings.defaultEditorLanguage}
                    onValueChange={(val) => setAppSettings(prev => ({ ...prev, defaultEditorLanguage: val }))}
                  >
                    <SelectTrigger className="w-full bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary focus:border-algora-gold focus:ring-algora-gold/20 rounded-lg h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
                      <SelectItem value="python">Python 3</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme (disabled) */}
                <div className="space-y-2">
                  <Label className="text-sm text-algora-text-muted">{t('theme')}</Label>
                  <Select value="dark" disabled>
                    <SelectTrigger className="w-full bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-algora-text-dim rounded-lg h-10 cursor-not-allowed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-algora-text-dim">{t('darkOnly')}</p>
                </div>
              </div>
            </section>

            {/* Editor Preferences Section */}
            <section className={sectionCard} style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-algora-green/10 border border-algora-green/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-algora-green" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-algora-text-primary">
                    {t('editorPreferences')}
                  </h2>
                  <p className="text-sm text-algora-text-dim">
                    {t('editorPreferencesDesc')}
                  </p>
                </div>
              </div>

              <Separator className="my-5 bg-[rgba(255,255,255,0.06)]" />

              <div className="space-y-4">
                {/* Font Size */}
                <div className="space-y-2">
                  <Label className="text-sm text-algora-text-muted">{t('fontSize')}</Label>
                  <Select
                    value={String(editorSettings.fontSize)}
                    onValueChange={(val) => setEditorSettings(prev => ({ ...prev, fontSize: Number(val) }))}
                  >
                    <SelectTrigger className="w-full bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary focus:border-algora-gold focus:ring-algora-gold/20 rounded-lg h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
                      <SelectItem value="14">14px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="18">18px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tab Size */}
                <div className="space-y-2">
                  <Label className="text-sm text-algora-text-muted">{t('tabSize')}</Label>
                  <Select
                    value={String(editorSettings.tabSize)}
                    onValueChange={(val) => setEditorSettings(prev => ({ ...prev, tabSize: Number(val) }))}
                  >
                    <SelectTrigger className="w-full bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-algora-text-primary focus:border-algora-gold focus:ring-algora-gold/20 rounded-lg h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-algora-card-bg border-[rgba(255,255,255,0.1)]">
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Word Wrap Toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-algora-text-muted">{t('wordWrap')}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-lg text-xs font-medium border ${
                      editorSettings.wordWrap
                        ? 'bg-algora-green/10 text-algora-green border-algora-green/20 hover:bg-algora-green/20'
                        : 'bg-[rgba(255,255,255,0.03)] text-algora-text-dim border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.06)]'
                    }`}
                    onClick={() => setEditorSettings(prev => ({ ...prev, wordWrap: !prev.wordWrap }))}
                  >
                    {editorSettings.wordWrap ? t('enabled') : t('disabled')}
                  </Button>
                </div>
              </div>

              {/* Save button */}
              <div className="mt-6 flex items-center gap-3">
                <Button
                  className="bg-algora-gold text-algora-bg-primary hover:bg-algora-gold/90 rounded-lg text-sm"
                  onClick={handleSaveEditorSettings}
                >
                  {saved ? <Check className="w-4 h-4 me-2" /> : null}
                  {saved ? t('settingsSaved') : t('save')}
                </Button>
              </div>
            </section>

            {/* Danger Zone */}
            <section className={`${sectionCard} border-algora-red/20`} style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-algora-red/10 border border-algora-red/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-algora-red" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-algora-red">
                    {t('dangerZone')}
                  </h2>
                  <p className="text-sm text-algora-text-dim">
                    {t('dangerZoneDesc')}
                  </p>
                </div>
              </div>

              <Separator className="my-5 bg-[rgba(255,255,255,0.06)]" />

              {!showDeleteConfirm ? (
                <Button
                  variant="ghost"
                  className="border border-algora-red/30 bg-algora-red/5 text-algora-red hover:bg-algora-red/10 hover:text-algora-red rounded-lg text-sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <AlertTriangle className="w-4 h-4 me-2" />
                  {t('deleteAccount')}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-algora-red/5 border border-algora-red/20 rounded-lg p-4">
                    <p className="text-sm text-algora-red">
                      {t('deleteAccountConfirm')}
                    </p>
                    <p className="text-xs text-algora-text-dim mt-1">
                      {t('deleteAccountWarning')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      className="bg-algora-red hover:bg-algora-red/90 text-white rounded-lg text-sm"
                      onClick={handleDeleteAccount}
                      disabled={deleteProgress}
                    >
                      {deleteProgress ? t('saving') || 'Deleting...' : t('deleteAccount')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="border-[rgba(255,255,255,0.1)] text-algora-text-muted hover:text-algora-text-primary rounded-lg text-sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
