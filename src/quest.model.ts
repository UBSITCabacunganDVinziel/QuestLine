export interface Quest {
    _id?: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Boss Fight';
    rewardGold: number;
    isCompleted: boolean;
    createdAt?: string;
  }