export type QuestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';

export interface ChoreObjective {
  id: string;
  name: string;
  category: 'Daily Maintenance' | 'Mental & Physical' | 'Deep Focus & Admin' | 'Epic Feats';
  difficulty: QuestDifficulty;
}

export interface QuestPayload {
  id: string;
  choreId: string;
  isCompleted: boolean;
}

export interface CharacterStats {
  name: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  gold: number;
  phpBalance: number;
  avatarSeed: string;
  completedChoresToday: Record<string, string>;
}
 
export const REWARD_TIERS: Record<QuestDifficulty, {
  xp: number,
  gold: number
}> = {
  EASY: {xp: 10, gold: 5},
  MEDIUM: {xp: 25, gold: 15},
  HARD: {xp: 50, gold: 30},
  EPIC: {xp: 100, gold: 75}
};

export const CHORE_LIST: ChoreObjective[] = [
  // Daily
  { id: 'm1', name: 'Tidy up personal space or make the bed', category: 'Daily Maintenance', difficulty: 'EASY' },
  { id: 'm2', name: 'Wash dishes or wipe counters', category: 'Daily Maintenance', difficulty: 'EASY' },
  { id: 'm3', name: 'Clean up notifications or tidy inbox desktop', category: 'Daily Maintenance', difficulty: 'EASY' },
  { id: 'm4', name: 'Prepare a healthy meal from scratch', category: 'Daily Maintenance', difficulty: 'MEDIUM' },

  // Mental and Physical
  { id: 'h1', name: 'Hydrate fully or take wellness supplements', category: 'Mental & Physical', difficulty: 'EASY' },
  { id: 'h2', name: 'Engage in a light 15-minute stretch or walk', category: 'Mental & Physical', difficulty: 'EASY' },
  { id: 'h3', name: 'Complete an intense 45+ minute workout', category: 'Mental & Physical', difficulty: 'MEDIUM' },
  { id: 'h4', name: 'Spend 30 minutes reading or learning a skill', category: 'Mental & Physical', difficulty: 'MEDIUM' },

  // Deep Focus and Admin
  { id: 'f1', name: 'Review goals and organize daily schedule', category: 'Deep Focus & Admin', difficulty: 'EASY' },
  { id: 'f2', name: 'Run 1 uninterrupted deep-focus session (Pomodoro)', category: 'Deep Focus & Admin', difficulty: 'MEDIUM' },
  { id: 'f3', name: 'Clear out a backlogged queue of personal files or bills', category: 'Deep Focus & Admin', difficulty: 'MEDIUM' },
  { id: 'f4', name: 'Submit formal structural paperwork or applications', category: 'Deep Focus & Admin', difficulty: 'HARD' }, 

  // Epic
  { id: 'e1', name: 'Deep clean an entire room or floor layout zone', category: 'Epic Feats', difficulty: 'HARD' },
  { id: 'e2', name: 'Cross off a major milestone item or personal project step', category: 'Epic Feats', difficulty: 'HARD' },
  { id: 'e3', name: 'Confront a complex challenge or difficult conversation', category: 'Epic Feats', difficulty: 'EPIC' }
];