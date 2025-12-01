import { useState } from 'react';
import { Plus, Lightbulb, Circle, CheckCircle2, Battery, Moon, BatteryLow, BatteryMedium, BatteryFull, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { RippleButton } from './RippleButton';
import { Input } from './ui/input';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { GradientHeader } from './GradientHeader';
import { AnimatedOceanCard } from './AnimatedOceanCard';
import { EmptyState } from './EmptyState';
import { HabitChallenge } from './HabitChallenge';
import { StreakBadge } from './StreakBadge';
import { TaskCreationModal, NewTask } from './TaskCreationModal';

interface TodayScreenProps {
  userName?: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
}

export function TodayScreen({ userName = 'Alex' }: TodayScreenProps) {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [currentEnergy, setCurrentEnergy] = useState<number>(60);
  const [energyHistory, setEnergyHistory] = useState<number[]>([60]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        {
          id: Date.now().toString(),
          title: newTask,
          completed: false,
        },
        ...tasks,
      ]);
      setNewTask('');
    }
  };

  const createTask = (taskData: NewTask) => {
    const newTaskItem: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      completed: false,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      description: taskData.description,
    };
    setTasks([newTaskItem, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const updateEnergy = (value: number) => {
    setCurrentEnergy(value);
    setEnergyHistory([...energyHistory, value]);
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const averageEnergy = energyHistory.length > 0 
    ? Math.round(energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length)
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('today.goodMorning');
    if (hour < 18) return t('today.goodAfternoon');
    return t('today.goodEvening');
  };

  const energyLevels = [
    { value: 20, icon: Moon, label: t('today.energy.tired'), color: '#94a3b8' },
    { value: 40, icon: BatteryLow, label: t('today.energy.low'), color: '#64748b' },
    { value: 60, icon: BatteryMedium, label: t('today.energy.okay'), color: '#4A9FD8' },
    { value: 80, icon: BatteryFull, label: t('today.energy.good'), color: '#52C9C1' },
    { value: 100, icon: Zap, label: t('today.energy.great'), color: '#5AB5E8' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <GradientHeader
        title={`${getGreeting()}, ${userName}!`}
        subtitle={t('today.subtitle')}
        variant="ocean"
      />

      {/* Streak Badge */}
      <div className="flex justify-center">
        <StreakBadge streak={3} type="tasks" />
      </div>

      {/* Tasks Summary Card */}
      <AnimatedOceanCard delay={0.1}>
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
                {t('today.tasksToday')}
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
                {tasks.length === 0
                  ? t('today.noTasks')
                  : `${completedTasks} ${t('today.of')} ${tasks.length} ${t('today.completed')}`
                }
              </p>
            </div>
            <div className="rounded-full bg-[#4A9FD8]/10 p-3">
              <Circle className="h-6 w-6 text-[#4A9FD8]" />
            </div>
          </div>
          {tasks.length > 0 && (
            <Progress value={(completedTasks / tasks.length) * 100} className="h-2" />
          )}
        </div>
      </AnimatedOceanCard>

      {/* Add Task Card */}
      <AnimatedOceanCard delay={0.15}>
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder={t('today.addTaskPlaceholder')}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              onClick={() => setIsModalOpen(true)}
              readOnly
              className="border-[#4A9FD8]/30 focus-visible:ring-[#4A9FD8] cursor-pointer"
            />
            <RippleButton
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
            </RippleButton>
          </div>
        </div>
      </AnimatedOceanCard>

      {/* Energy Tracker Card */}
      <AnimatedOceanCard delay={0.2}>
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-[#52C9C1]/10 p-2">
              <Battery className="h-5 w-5 text-[#52C9C1]" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
              {t('today.energyNow')}
            </h3>
          </div>
          <p className="mb-4 text-muted-foreground" style={{ fontSize: '14px' }}>
            {energyHistory.length > 1
              ? `${t('today.avgEnergy')}: ${averageEnergy}%`
              : t('today.trackEnergyPrompt')
            }
          </p>
          <div className="flex justify-between gap-2">
            {energyLevels.map((level) => (
              <motion.button
                key={level.value}
                onClick={() => updateEnergy(level.value)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                  currentEnergy === level.value
                    ? 'border-[#4A9FD8] bg-[#4A9FD8]/10'
                    : 'border-border/50 hover:border-[#4A9FD8]/50 hover:bg-[#4A9FD8]/5'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <level.icon className="h-5 w-5" style={{ color: level.color }} />
                <span className="text-muted-foreground" style={{ fontSize: '10px' }}>
                  {level.value}%
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </AnimatedOceanCard>

      {/* AI Tip Card */}
      <AnimatedOceanCard delay={0.25}>
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
              {t('today.aiTip')}
            </h3>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600 }} className="mb-2">
            {t('today.tipTitle')}
          </p>
          <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
            {t('today.tipContent')}
          </p>
        </div>
      </AnimatedOceanCard>

      {/* Habit Challenge */}
      <HabitChallenge />

      {/* Nearest Tasks */}
      <div>
        <h3 className="mb-4" style={{ fontSize: '18px', fontWeight: 600 }}>
          {t('today.nearestTasks')}
        </h3>
        {tasks.length === 0 ? (
          <EmptyState
            illustration="tasks"
            title={t('today.noTasksTitle')}
            description={t('today.noTasksDesc')}
            actionLabel={t('today.createFirstTask')}
            onAction={() => document.querySelector<HTMLInputElement>('input')?.focus()}
          />
        ) : (
          <AnimatedOceanCard delay={0.3}>
            <div className="divide-y divide-border/50">
              {tasks.slice(0, 4).map((task, index) => (
                <motion.div
                  key={task.id}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                >
                  <motion.button
                    onClick={() => toggleTask(task.id)}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-[#4A9FD8]" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </motion.button>
                  <span
                    className={task.completed ? 'text-muted-foreground line-through' : ''}
                    style={{ fontSize: '14px' }}
                  >
                    {task.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </AnimatedOceanCard>
        )}
      </div>

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTask={createTask}
      />
    </div>
  );
}