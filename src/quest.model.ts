export interface UserAccount {
  username: string;
  password?: string; 
  xp: number;
  gold: number;
  level: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'Vitality' | 'Mind/Focus' | 'Guild Chores' | 'Social/Charisma' | 'Rest/Recovery';
  xpReward: number;
  goldReward: number;
  startTime?: string;      
  durationMinutes?: number; 
  isCompleted: boolean;
  lockedUntil?: string; 
}
