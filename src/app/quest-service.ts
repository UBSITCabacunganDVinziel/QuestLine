import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CharacterStats, QuestPayload } from '../quest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/stats';

  //  Authentication State Signals
  public isAuthenticated = signal<boolean>(false);
  public currentUserToken = signal<string | null>(null);

  //  Core Game Engine Signals
  public stats = signal<CharacterStats>({
    name: 'Guest Player',
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    gold: 0,
    phpBalance: 0,
    avatarSeed: 'QuestLineHero',
    completedChoresToday: {}
  });
  public quests = signal<QuestPayload[]>([]);
  public gameAlertMessage = signal<string>('');

  
  signInPlayer(credentials: any) {
    this.http.post<{token: string, stats: CharacterStats}>(`${this.baseUrl}/auth/signin`, credentials)
      .subscribe({
        next: (res) => {
          this.currentUserToken.set(res.token);
          this.stats.set(res.stats);
          this.isAuthenticated.set(true);
          this.gameAlertMessage.set('Authentication cleared! Loading system dashboard...');
          this.loadActiveQuests();
        },
        error: (err) => this.gameAlertMessage.set(err.error?.message || 'Access Denied.')
      });
  }

  signUpPlayer(accountData: any) {
    this.http.post<{message: string}>(`${this.baseUrl}/auth/signup`, accountData)
      .subscribe({
        next: () => this.gameAlertMessage.set('Account generated! Ready for login.'),
        error: (err) => this.gameAlertMessage.set(err.error?.message || 'Registration failed.')
      });
  }

  logoutPlayer() {
    this.isAuthenticated.set(false);
    this.currentUserToken.set(null);
    this.quests.set([]);
  }


  public loadActiveQuests() {
    this.http.get<QuestPayload[]>(`${this.baseUrl}/quests`)
      .subscribe(data => this.quests.set(data));
  }


  isChoreLocked(choreId: string): boolean {
    const activeStats = this.stats();
    if (!activeStats || !activeStats.completedChoresToday) return false;
    return !!activeStats.completedChoresToday[choreId];
  }


  addQuest(choreId: string) {
    this.http.post<QuestPayload[]>(`${this.baseUrl}/quests`, { choreId })
      .subscribe({
        next: (updatedQuests) => this.quests.set(updatedQuests),
        error: (err) => console.error('Failed to add quest:', err)
      });
  }


  completeQuest(questId: string) {
    this.http.post<{quests: QuestPayload[], stats: CharacterStats}>(`${this.baseUrl}/quests/${questId}/complete`, {})
      .subscribe({
        next: (res) => {
          this.quests.set(res.quests);
          this.stats.set(res.stats);
        },
        error: (err) => console.error('Failed to complete quest:', err)
      });
  }

 
  deleteQuest(questId: string) {
    this.http.delete<QuestPayload[]>(`${this.baseUrl}/quests/${questId}`)
      .subscribe({
        next: (updatedQuests) => this.quests.set(updatedQuests),
        error: (err) => console.error('Failed to clear quest:', err)
      });
  }


  updateCharacterName(newName: string) {
    this.http.put<CharacterStats>(`${this.baseUrl}/stats/name`, { name: newName.trim() })
      .subscribe({
        next: (updatedStats) => this.stats.set(updatedStats),
        error: (err) => console.error('Error rewriting username:', err)
      });
  }

  
  exchangeGoldToPhp(exchangeAmount: number) {
    this.http.post<CharacterStats>(`${this.baseUrl}/stats/exchange`, { amount: exchangeAmount })
      .subscribe({
        next: (updatedStats) => this.stats.set(updatedStats),
        error: (err) => console.error('Error updating your wallet balance. Could not complete the Gold exchange right now.', err)
      });
  }
}