import { useState } from 'react';
import { Plus, Circle, CheckCircle2, Clock, Flag, ListTodo } from 'lucide-react';
import { Card } from './ui/card';
import { RippleButton } from './RippleButton';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AnimatedCard, StaggerContainer, staggerItemVariants } from './AnimatedScreen';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { EmptyState } from './EmptyState';
import { GradientHeader } from './GradientHeader';
import { AnimatedOceanCard } from './AnimatedOceanCard';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  time?: string;
  energy?: 'low' | 'medium' | 'high';
}

export function TaskList() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Review project proposal',
      completed: false,
      priority: 'high',
      time: '9:00 AM',
      energy: 'high',
    },
    {
      id: '2',
      title: 'Team standup meeting',
      completed: true,
      priority: 'medium',
      time: '10:30 AM',
      energy: 'medium',
    },
    {
      id: '3',
      title: 'Update documentation',
      completed: false,
      priority: 'low',
      time: '2:00 PM',
      energy: 'low',
    },
    {
      id: '4',
      title: 'Code review',
      completed: false,
      priority: 'medium',
      energy: 'medium',
    },
  ]);

  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        {
          id: Date.now().toString(),
          title: newTask,
          completed: false,
          priority: 'medium',
        },
        ...tasks,
      ]);
      setNewTask('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'low': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return t('tasks.priority.high');
      case 'medium': return t('tasks.priority.medium');
      case 'low': return t('tasks.priority.low');
      default: return priority;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <GradientHeader
        title={t('tasks.title')}
        subtitle={`${stats.active} ${t('tasks.active').toLowerCase()}, ${stats.completed} ${t('tasks.completed').toLowerCase()}`}
        icon={<ListTodo className="h-6 w-6" />}
        variant="sky"
      />

      {/* Add Task with Ocean Card */}
      <AnimatedOceanCard delay={0.1}>
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder={t('tasks.addNew')}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="border-[#4A9FD8]/30 focus-visible:ring-[#4A9FD8]"
            />
            <RippleButton
              onClick={addTask}
              className="bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1] text-white hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
            </RippleButton>
          </div>
        </div>
      </AnimatedOceanCard>

      {/* Stats with Ocean Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('tasks.all'), value: stats.total, color: '#4A9FD8' },
          { label: t('tasks.active'), value: stats.active, color: '#52C9C1' },
          { label: t('tasks.completed'), value: stats.completed, color: '#5AB5E8' },
        ].map((stat, index) => (
          <AnimatedOceanCard key={index} delay={0.2 + index * 0.05}>
            <div className="p-4 text-center">
              <p className="text-muted-foreground" style={{ fontSize: '12px' }}>
                {stat.label}
              </p>
              <motion.p 
                style={{ fontSize: '24px', fontWeight: 700 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: 'spring',
                  delay: 0.3 + index * 0.05,
                  stiffness: 200,
                }}
              >
                {stat.value}
              </motion.p>
            </div>
          </AnimatedOceanCard>
        ))}
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">{t('tasks.all')}</TabsTrigger>
          <TabsTrigger value="active">{t('tasks.active')}</TabsTrigger>
          <TabsTrigger value="completed">{t('tasks.completed')}</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {filteredTasks.length === 0 ? (
            <EmptyState
              illustration="tasks"
              title={t('tasks.empty')}
              description={t('tasks.emptyDescription')}
              actionLabel={t('tasks.addNew')}
              onAction={() => document.querySelector<HTMLInputElement>('input')?.focus()}
            />
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task, index) => (
                <AnimatedOceanCard key={task.id} delay={0.05 * index} showWaves={false}>
                  <div className="flex items-center gap-4 p-4">
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

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={task.completed ? 'text-muted-foreground line-through' : ''}
                          style={{ fontSize: '14px', fontWeight: 500 }}
                        >
                          {task.title}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {task.time && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span style={{ fontSize: '12px' }}>{task.time}</span>
                          </div>
                        )}
                        <Badge
                          variant="secondary"
                          className={getPriorityColor(task.priority)}
                        >
                          <Flag className="mr-1 h-3 w-3" />
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </AnimatedOceanCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}