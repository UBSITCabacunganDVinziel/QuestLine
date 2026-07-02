import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CharacterStats, QuestPayload } from '../quest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private http = inject(HttpClient);
  
  //to prevent Access Denied Routing logs
  private authUrl = 'http://localhost:3000/api/auth';
  private gameUrl = 'http://localhost:3000/api';

  public isAuthenticated = signal<boolean>(false);
  public currentUserToken = signal<string | null>(null);

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
    this.http.post<{token: string, stats: CharacterStats}>(`${this.authUrl}/signin`, credentials)
      .subscribe({
        next: (res) => {
          this.currentUserToken.set(res.token);
          this.stats.set(res.stats);
          this.isAuthenticated.set(true);
          this.gameAlertMessage.set('');
          this.loadActiveQuests();
        },
        error: (err) => this.gameAlertMessage.set(err.error?.error || 'Access Denied.')
      });
  }

  signUpPlayer(accountData: any) {
    this.http.post<{message: string}>(`${this.authUrl}/signup`, accountData)
      .subscribe({
        next: () => this.gameAlertMessage.set('Account generated! Ready for login.'),
        error: (err) => this.gameAlertMessage.set(err.error?.error || 'Registration failed.')
      });
  }

  logoutPlayer() {
    this.isAuthenticated.set(false);
    this.currentUserToken.set(null);
    this.quests.set([]);
    this.gameAlertMessage.set('');
  }

  public loadActiveQuests() {
    this.http.get<QuestPayload[]>(`${this.gameUrl}/quests`)
      .subscribe({
        next: (data) => this.quests.set(data),
        error: (err) => console.error('Failed to load quests board:', err)
      });
  }

  isChoreLocked(choreId: string): boolean {
    const activeStats = this.stats();
    if (!activeStats || !activeStats.completedChoresToday) return false;
    
    if (activeStats.completedChoresToday instanceof Map) {
      return activeStats.completedChoresToday.has(choreId);
    }
    return !!(activeStats.completedChoresToday as any)[choreId];
  }

  addQuest(choreId: string) {
    this.http.post<QuestPayload>(`${this.gameUrl}/quests`, { choreId })
      .subscribe({
        next: (newQuest) => {
          this.quests.update(currentList => [...currentList, newQuest]);
          this.gameAlertMessage.set('');
        },
        error: (err) => this.gameAlertMessage.set('Failed to save adventure to board registry.')
      });
  }

  completeQuest(questId: string, difficulty: string) {
    this.http.put<{quest: QuestPayload, stats: CharacterStats}>(`${this.gameUrl}/quests/${questId}/complete`, { difficulty })
      .subscribe({
        next: (res) => {
          this.stats.set(res.stats);
          this.loadActiveQuests();
        },
        error: (err) => this.gameAlertMessage.set(err.error?.error || 'Quest action blocked.')
      });
  }

  deleteQuest(questId: string) {
    this.http.delete(`${this.gameUrl}/quests/${questId}`)
      .subscribe({
        next: () => {
          this.quests.update(list => list.filter(q => q.id !== questId));
        }
      });
  }

  exchangeGoldToPhp(goldAmount: number) {
    this.http.post<CharacterStats>(`${this.gameUrl}/stats/exchange`, { goldAmount })
      .subscribe({
        next: (updatedStats) => {
          this.stats.set(updatedStats);
          this.gameAlertMessage.set('');
        },
        error: (err) => this.gameAlertMessage.set(err.error?.error || 'Exchange process error.')
      });
  }

  updateCharacterName(newName: string) {
    return this.http.put<CharacterStats>(`${this.gameUrl}/stats/name`, { name: newName }).pipe(
      tap(updatedStats => {
        this.stats.set(updatedStats);
      })
    );
  }

  deleteProfileRecord() {
    return this.http.delete(`${this.gameUrl}/stats/account`);
  }
}

import { tap } from 'rxjs/operators';
