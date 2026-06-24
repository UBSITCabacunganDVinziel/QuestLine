export interface Quest {
<<<<<<< HEAD
    _id?: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Boss Fight';
    rewardGold: number;
    isCompleted: boolean;
    createdAt?: string;
=======
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
>>>>>>> b63b0c7b6a38033aee799337b8266a8cc4645b9e
  }