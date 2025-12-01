import { Home, ListTodo, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const { t } = useLanguage();
  
  const navItems = [
    { id: 'today', label: t('nav.today'), icon: Home },
    { id: 'tasks', label: t('nav.tasks'), icon: ListTodo },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                isActive
                  ? 'text-[#4A9FD8]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-[#4A9FD8] to-[#52C9C1]"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              
              {/* Icon with animation */}
              <motion.div
                animate={isActive ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ 
                  duration: 0.5,
                  ease: "easeInOut"
                }}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'fill-[#4A9FD8]/20' : ''}`} />
              </motion.div>
              
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{item.label}</span>
              
              {/* Ripple effect on tap */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-[#4A9FD8]/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}