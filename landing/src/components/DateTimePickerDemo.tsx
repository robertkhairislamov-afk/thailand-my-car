import { useState } from 'react';
import { DateTimePicker } from './DateTimePicker';
import { TaskCreationModal } from './TaskCreationModal';
import { RippleButton } from './RippleButton';
import { Calendar, Clock, Plus } from 'lucide-react';
import { AnimatedOceanCard } from './AnimatedOceanCard';
import { GradientHeader } from './GradientHeader';
import { useLanguage } from './LanguageContext';

export function DateTimePickerDemo() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<any[]>([]);

  const formatFullDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('ru-RU', options);
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <GradientHeader
        title="Date & Time Picker Demo"
        subtitle="iOS-style swipe picker for Saturway"
        variant="ocean"
      />

      <div className="mt-8 space-y-6">
        {/* Standalone Picker Demo */}
        <AnimatedOceanCard>
          <div className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#4A9FD8]" />
              <h3 className="text-lg font-semibold">Standalone Picker</h3>
            </div>

            <DateTimePicker
              value={selectedDate}
              onChange={setSelectedDate}
              mode="datetime"
            />

            <div className="mt-6 rounded-xl bg-[#4A9FD8]/10 p-4">
              <p className="text-center text-sm text-muted-foreground">
                Выбранная дата и время:
              </p>
              <p className="mt-2 text-center font-semibold">
                {formatFullDateTime(selectedDate)}
              </p>
            </div>
          </div>
        </AnimatedOceanCard>

        {/* Date Only Picker */}
        <AnimatedOceanCard delay={0.1}>
          <div className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#52C9C1]" />
              <h3 className="text-lg font-semibold">Date Only</h3>
            </div>

            <DateTimePicker
              value={selectedDate}
              onChange={setSelectedDate}
              mode="date"
            />
          </div>
        </AnimatedOceanCard>

        {/* Time Only Picker */}
        <AnimatedOceanCard delay={0.15}>
          <div className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#5AB5E8]" />
              <h3 className="text-lg font-semibold">Time Only</h3>
            </div>

            <DateTimePicker
              value={selectedDate}
              onChange={setSelectedDate}
              mode="time"
            />
          </div>
        </AnimatedOceanCard>

        {/* Task Creation Modal Demo */}
        <AnimatedOceanCard delay={0.2}>
          <div className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#FFD93D]" />
              <h3 className="text-lg font-semibold">Task Creation Modal</h3>
            </div>

            <RippleButton
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] py-4 text-white"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t('taskModal.createTask')}
            </RippleButton>

            {createdTasks.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Созданные задачи:
                </p>
                {createdTasks.map((task, index) => (
                  <div
                    key={index}
                    className="rounded-xl border-2 border-border/50 bg-card p-4"
                  >
                    <p className="font-semibold">{task.title}</p>
                    {task.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.dueDate && (
                        <span className="rounded-full bg-[#4A9FD8]/10 px-3 py-1 text-xs font-medium text-[#4A9FD8]">
                          <Calendar className="mr-1 inline h-3 w-3" />
                          {task.dueDate.toLocaleDateString('ru-RU')}
                        </span>
                      )}
                      {task.priority && (
                        <span
                          className="rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor:
                              task.priority === 'high'
                                ? '#ef444410'
                                : task.priority === 'medium'
                                ? '#4A9FD810'
                                : '#94a3b810',
                            color:
                              task.priority === 'high'
                                ? '#ef4444'
                                : task.priority === 'medium'
                                ? '#4A9FD8'
                                : '#94a3b8',
                          }}
                        >
                          {task.priority === 'high'
                            ? 'Высокий'
                            : task.priority === 'medium'
                            ? 'Средний'
                            : 'Низкий'}
                        </span>
                      )}
                      {task.reminder && (
                        <span className="rounded-full bg-[#FFD93D]/10 px-3 py-1 text-xs font-medium text-[#FFD93D]">
                          Напоминание
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedOceanCard>

        {/* Features List */}
        <AnimatedOceanCard delay={0.25}>
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Особенности</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• iOS-style wheel picker с плавной прокруткой</li>
              <li>• Drag & drop для выбора даты и времени</li>
              <li>• Smooth animations с Motion</li>
              <li>• Океанская цветовая палитра (#4A9FD8, #52C9C1, #5AB5E8)</li>
              <li>• Поддержка 3 режимов: дата, время, дата+время</li>
              <li>• Умное форматирование: "Сегодня", "Завтра"</li>
              <li>• Интервал минут: 5 минут</li>
              <li>• Выбор даты на 30 дней вперёд</li>
              <li>• Интеграция в модальное окно создания задачи</li>
              <li>• Полная локализация (RU/EN)</li>
              <li>• Приоритет задач с визуальными индикаторами</li>
              <li>• Опциональные напоминания</li>
            </ul>
          </div>
        </AnimatedOceanCard>
      </div>

      <TaskCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTask={(task) => {
          setCreatedTasks([...createdTasks, task]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
