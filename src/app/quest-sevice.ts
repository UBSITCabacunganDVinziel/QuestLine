import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuestPayload, CharacterStats } from '../quest.model';
import { CHORE_LIST } from '../quest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  
  private questsSignal = signal<QuestPayload[]>([]);
  private statsSignal = signal<CharacterStats>({
    name: 'Player 1',
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    gold: 0,
    phpBalance: 0.00,
    avatarSeed: 'QuestLineHero',
    completedChoresToday: {}
  });

 
  public gameAlertMessage = signal<string>('');

  public quests = computed(() => this.questsSignal());
  public stats = computed(() => this.statsSignal());

  constructor() {
    this.fetchInitialData();
  }

  private fetchInitialData() {
    this.http.get<QuestPayload[]>(${this.apiUrl}/quests).subscribe({
      next: (data) => this.questsSignal.set(data),
      error: (err) => console.error('Failed fetching active quests from MongoDB:', err)
    });

    this.http.get<CharacterStats>(${this.apiUrl}/stats).subscribe({
      next: (data) => this.statsSignal.set(data),
      error: (err) => console.error('Failed fetching account metrics from MongoDB:', err)
    });
  }

  addQuest(choreId: string) {
    const choreExists = CHORE_LIST.some((c) => c.id === choreId);
    if (!choreExists) return;

    
    const isAlreadyActive = this.questsSignal().some(q => q.choreId === choreId && !q.isCompleted);
    if (isAlreadyActive) {
      this.gameAlertMessage.set("This objective assignment is already active on your dashboard.");
      return;
    }

    this.http.post<QuestPayload>(${this.apiUrl}/quests, { choreId }).subscribe({
      next: (newQuest) => {
        this.questsSignal.update(quests => [...quests, newQuest]);
        this.gameAlertMessage.set(''); 
      },
      error: (err) => console.error('Failed pushing quest entity to database node:', err)
    });
  }

  deleteQuest(id: string) {
    this.http.delete(${this.apiUrl}/quests/${id}).subscribe({
      next: () => {
        this.questsSignal.update(quests => quests.filter(q => q.id !== id));
      },
      error: (err) => console.error('Error deleting quest from database ledger:', err)
    });
  }

  isChoreLocked(choreId: string): boolean {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastCompletedDate = this.stats().completedChoresToday?.[choreId];
    return lastCompletedDate === todayStr;
  }

  completeQuest(id: string) {
    this.gameAlertMessage.set('');
    const targetedQuest = this.questsSignal().find(q => q.id === id);

    if (targetedQuest && !targetedQuest.isCompleted) {
      const choreMetadata = CHORE_LIST.find((c) => c.id === targetedQuest.choreId);
      
      if (choreMetadata) {
        if (this.isChoreLocked(targetedQuest.choreId)) {
          this.gameAlertMessage.set("Cheat Guard Active: Quest cooldown period is ticking!");
          return; 
        }

        this.http.put<{ quest: QuestPayload, stats: CharacterStats }>(
          ${this.apiUrl}/quests/${id}/complete, 
          { difficulty: choreMetadata.difficulty }
        ).subscribe({
          next: (response) => {
            this.questsSignal.update(quests => quests.map(q => q.id === id ? response.quest : q));
            this.statsSignal.set(response.stats);
          },
          error: (err) => {
            this.gameAlertMessage.set(err.error?.error || "Security validation rejection occurred.");
          }
        });
      }
    }
  }

  exchangeGoldToPhp(goldAmount: number) {
    this.gameAlertMessage.set('');
    if (goldAmount <= 0 || this.stats().gold < goldAmount) {
      this.gameAlertMessage.set('Insufficient inventory balance for this exchange request.');
      return;
    }

    this.http.post<CharacterStats>(${this.apiUrl}/stats/exchange, { goldAmount }).subscribe({
      next: (updatedStats) => {
        this.statsSignal.set(updatedStats);
      },
      error: (err) => this.gameAlertMessage.set(err.error?.error || "Transaction network dropped.")
    });
  }

  updateCharacterName(newName: string) {
    if (!newName.trim()) return;

    this.http.put<CharacterStats>(${this.apiUrl}/stats/name, { name: newName.trim() }).subscribe({
      next: (savedStats) => {
        this.statsSignal.update(current => ({ ...current, name: savedStats.name }));
      },
      error: (err) => console.error('Unable to finalize profile changes on cloud registry:', err)
    });
  }
}