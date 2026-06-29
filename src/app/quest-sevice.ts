import { Injectable, signal, computed } from '@angular/core';
import { Quest, CharacterStats, CHORE_LIST, REWARD_TIERS } from './quest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private questsSignal = signal<Quest[]>(this.loadQuests());
  private statsSignal = signal<CharacterStats>(this.loadStats());

  public quests = computed(() => this.questsSignal());
  public stats = computed(() => this.statsSignal());

  private loadQuests(): Quest[] {
    return JSON.parse(localStorage.getItem('questline_quests') || '[]');
  }

  private loadStats(): CharacterStats {
    return JSON.parse(localStorage.getItem('questline_stats') || JSON.stringify({
      name: 'Player 1',
      level: 1,
      currentXp: 0,
      nextLevelXp: 100,
      gold: 0,
      avatarSeed: 'QuestLineHero'
    }));
  }

  private saveState() {
    localStorage.setItem('questline_quests', JSON.stringify(this.questsSignal()));
    localStorage.setItem('questline_stats', JSON.stringify(this.statsSignal()));
  }

  addQuest(choreId: string) {
    const choreExists = CHORE_LIST.some(c => c.id === choreId);
    if (!choreExists) return;

    const newQuest: Quest = {
      id: crypto.randomUUID(),
      choreId: choreId, 
      isCompleted: false
    };

    this.questsSignal.update(quests => [...quests, newQuest]);
    this.saveState();
  }

  deleteQuest(id: string) {
    this.questsSignal.update(quests => quests.filter(q => q.id !== id));
    this.saveState();
  }

  completeQuest(id: string) {
    this.questsSignal.update(quests => quests.map(q => {
      if (q.id === id && !q.isCompleted) {
        const choreMetadata = CHORE_LIST.find(c => c.id === q.choreId);
        
        if (choreMetadata) {
          const rewards = REWARD_TIERS[choreMetadata.difficulty];
          this.awardRewards(rewards.xp, rewards.gold);
        }
        
        return { ...q, isCompleted: true };
      }
      return q;
    }));
    this.saveState();
  }

  private awardRewards(xp: number, gold: number) {
    this.statsSignal.update(current => {
      let updatedXp = current.currentXp + xp;
      let updatedLevel = current.level;
      let updatedNextLevelXp = current.nextLevelXp;

      while (updatedXp >= updatedNextLevelXp) {
        updatedXp -= updatedNextLevelXp;
        updatedLevel++;
        updatedNextLevelXp = updatedLevel * 100;
      }

      return {
        ...current,
        gold: current.gold + gold,
        currentXp: updatedXp,
        level: updatedLevel,
        nextLevelXp: updatedNextLevelXp,
        avatarSeed: `Hero-${updatedLevel}-${Math.floor(Math.random() * 1000)}`
      };
    });
  }

  updateCharacterName(newName: string) {
    this.statsSignal.update(current => ({ ...current, name: newName }));
    this.saveState();
  }
}