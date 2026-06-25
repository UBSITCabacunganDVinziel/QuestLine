import { Injectable, signal, computed } from '@angular/core';
import { Quest, CharacterStats } from '../models/quest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  // Signals for state management
  private questsSignal = signal<Quest[]>(this.loadQuests());
  private statsSignal = signal<CharacterStats>(this.loadStats());

  // Public read-only reactive views
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

  addQuest(title: string, description: string, difficulty: 'Easy' | 'Medium' | 'Hard') {
    let xp = 20;
    let gold = 10;

    if (difficulty === 'Medium') { xp = 50; gold = 25; }
    if (difficulty === 'Hard') { xp = 100; gold = 60; }

    const newQuest: Quest = {
      id: crypto.randomUUID(),
      title,
      description,
      difficulty,
      xpReward: xp,
      goldReward: gold,
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
        this.awardRewards(q.xpReward, q.goldReward);
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