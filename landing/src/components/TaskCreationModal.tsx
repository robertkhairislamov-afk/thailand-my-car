import { useState } from 'react';
import { X, Plus, Calendar, Clock, Bell, Flag, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { RippleButton } from './RippleButton';
import { DateTimePicker } from './DateTimePicker';
import { useLanguage } from './LanguageContext';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: NewTask) => void;
}

export interface NewTask {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  reminder?: boolean;
}

type ModalStep = 'basic' | 'datetime' | 'details';

export function TaskCreationModal({ isOpen, onClose, onCreateTask }: TaskCreationModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<ModalStep>('basic');
  const [task, setTask] = useState<NewTask>({
    title: '',
    description: '',
    priority: 'medium',
    reminder: false,
  });
  const [tempDate, setTempDate] = useState(new Date());

  const handleCreate = () => {
    if (task.title.trim()) {
      onCreateTask(task);
      resetModal();
    }
  };

  const resetModal = () => {
    setTask({
      title: '',
      description: '',
      priority: 'medium',
      reminder: false,
    });
    setStep('basic');
    setTempDate(new Date());
    onClose();
  };

  const handleDateTimeConfirm = () => {
    setTask({ ...task, dueDate: tempDate });
    setStep('basic');
  };

  const priorities = [
    { value: 'low', label: t('tasks.priority.low'), color: '#94a3b8', icon: '🟢' },
    { value: 'medium', label: t('tasks.priority.medium'), color: '#4A9FD8', icon: '🟡' },
    { value: 'high', label: t('tasks.priority.high'), color: '#ef4444', icon: '🔴' },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetModal}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-3xl bg-card shadow-2xl border border-border/50"
            style={{
              maxHeight: 'calc(100vh - 100px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 p-6">
              <div>
                <h2 className="text-xl font-semibold">{t('taskModal.createTask')}</h2>
                <p className="text-sm text-muted-foreground">{t('taskModal.fillDetails')}</p>
              </div>
              <button
                onClick={resetModal}
                className="rounded-full p-2 transition-colors hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {step === 'basic' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  {/* Task Title */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-[#4A9FD8]" />
                      {t('taskModal.taskTitle')}
                    </label>
                    <Input
                      placeholder={t('taskModal.taskTitlePlaceholder')}
                      value={task.title}
                      onChange={(e) => setTask({ ...task, title: e.target.value })}
                      className="border-[#4A9FD8]/30 focus-visible:ring-[#4A9FD8]"
                      autoFocus
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4 text-[#52C9C1]" />
                      {t('taskModal.description')}
                      <span className="text-xs text-muted-foreground">({t('taskModal.optional')})</span>
                    </label>
                    <Textarea
                      placeholder={t('taskModal.descriptionPlaceholder')}
                      value={task.description}
                      onChange={(e) => setTask({ ...task, description: e.target.value })}
                      className="min-h-[80px] resize-none border-[#52C9C1]/30 focus-visible:ring-[#52C9C1]"
                    />
                  </div>

                  {/* Date & Time Button */}
                  <button
                    onClick={() => setStep('datetime')}
                    className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-[#4A9FD8]/30 bg-[#4A9FD8]/5 p-4 transition-all hover:border-[#4A9FD8]/50 hover:bg-[#4A9FD8]/10"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#4A9FD8]" />
                      <Clock className="h-5 w-5 text-[#52C9C1]" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">
                        {task.dueDate
                          ? formatDateTime(task.dueDate, t)
                          : t('taskModal.selectDateTime')}
                      </div>
                      {!task.dueDate && (
                        <div className="text-xs text-muted-foreground">
                          {t('taskModal.tapToSelect')}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Priority Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Flag className="h-4 w-4 text-[#5AB5E8]" />
                      {t('taskModal.priority')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {priorities.map((priority) => (
                        <motion.button
                          key={priority.value}
                          onClick={() => setTask({ ...task, priority: priority.value })}
                          className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                            task.priority === priority.value
                              ? 'border-current bg-current/10'
                              : 'border-border/50 hover:border-current/50 hover:bg-current/5'
                          }`}
                          style={{
                            color: priority.color,
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-2xl">{priority.icon}</span>
                          <span className="text-xs font-medium">{priority.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Reminder Toggle */}
                  <button
                    onClick={() => setTask({ ...task, reminder: !task.reminder })}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      task.reminder
                        ? 'border-[#FFD93D]/50 bg-[#FFD93D]/10'
                        : 'border-border/50 hover:border-[#FFD93D]/30 hover:bg-[#FFD93D]/5'
                    }`}
                  >
                    <Bell className={`h-5 w-5 ${task.reminder ? 'text-[#FFD93D]' : 'text-muted-foreground'}`} />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{t('taskModal.reminder')}</div>
                      <div className="text-xs text-muted-foreground">
                        {task.reminder ? t('taskModal.reminderOn') : t('taskModal.reminderOff')}
                      </div>
                    </div>
                    <div
                      className={`h-6 w-11 rounded-full transition-colors ${
                        task.reminder ? 'bg-[#FFD93D]' : 'bg-muted'
                      }`}
                    >
                      <motion.div
                        className="h-5 w-5 rounded-full bg-white shadow-md"
                        animate={{ x: task.reminder ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{ marginTop: 2 }}
                      />
                    </div>
                  </button>
                </motion.div>
              )}

              {step === 'datetime' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <DateTimePicker
                    value={tempDate}
                    onChange={setTempDate}
                    mode="datetime"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('basic')}
                      className="flex-1 rounded-xl border-2 border-border/50 py-3 font-medium transition-colors hover:bg-muted"
                    >
                      {t('taskModal.back')}
                    </button>
                    <RippleButton
                      onClick={handleDateTimeConfirm}
                      className="flex-1 bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] py-3 text-white"
                    >
                      {t('taskModal.confirm')}
                    </RippleButton>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {step === 'basic' && (
              <div className="border-t border-border/50 p-6">
                <RippleButton
                  onClick={handleCreate}
                  disabled={!task.title.trim()}
                  className="w-full bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] py-4 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {t('taskModal.createButton')}
                </RippleButton>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function formatDateTime(date: Date, t: (key: string) => string): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let dateStr = '';
  if (date.toDateString() === today.toDateString()) {
    dateStr = t('datePicker.today');
  } else if (date.toDateString() === tomorrow.toDateString()) {
    dateStr = t('datePicker.tomorrow');
  } else {
    dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }

  const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr}, ${timeStr}`;
}
