export interface Quest {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    xpReward: number;
    goldReward: number;
    isCompleted: boolean;
  }
  
  export interface CharacterStats {
    name: string;
    level: number;
    currentXp: number;
    nextLevelXp: number;
    gold: number;
    avatarSeed: string;
  }