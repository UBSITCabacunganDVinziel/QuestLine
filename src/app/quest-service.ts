import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CharacterStats, QuestPayload } from '../quest.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private http = inject(HttpClient);
  
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
    this.http.post<{success: boolean, token?: string, userId: string, username: string}>(`${this.authUrl}/signin`, credentials)
      .subscribe({
        next: (res) => {
          this.currentUserToken.set(res.token || 'mock-token');
          this.isAuthenticated.set(true);
          this.gameAlertMessage.set('');
          
          this.loadStatsFromServer(res.userId);
          this.loadActiveQuests(res.userId);
        },
        error: (err) => this.gameAlertMessage.set(err.error?.error || 'Access Denied.')
      });
  }

  signUpPlayer(accountData: any) {
    this.http.post<{success: boolean, message: string}>(`${this.authUrl}/signup`, accountData)
      .subscribe({
        next: () => this.gameAlertMessage.set('Account generated! Ready for login.'),
        error: (err) => this.gameAlertMessage.set(err.error?.error || 'Registration failed.')
      });
  }

  logoutPlayer() {
    this.isAuthenticated.set(false);
    this.currentUserToken.set(null);
    this.quests.set([]);
    
    this.stats.set({
      name: 'Guest Player',
      gold: 0,
      level: 1,
      currentXp: 0,
      nextLevelXp: 100,
      phpBalance: 0,
      avatarSeed: 'QuestLineHero',
      completedChoresToday: {}
    });
    this.gameAlertMessage.set('');
  }

  public loadStatsFromServer(userId: string) {
    this.http.get<CharacterStats>(`${this.gameUrl}/stats/${userId}`)
      .subscribe({
        next: (data) => this.stats.set(data),
        error: (err) => console.error('Failed to load player statistics:', err)
      });
  }

  public loadActiveQuests(userId: string) {
    this.http.get<QuestPayload[]>(`${this.gameUrl}/quests/${userId}`)
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
    const currentStats = this.stats();
    const userId = (currentStats as any).userId || (currentStats as any)._id;

    this.http.post<QuestPayload>(`${this.gameUrl}/quests`, { userId, choreId })
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
          const currentStats = this.stats();
          const userId = (currentStats as any).userId || (currentStats as any)._id;
          if (userId) this.loadActiveQuests(userId);
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
    const currentStats = this.stats();
    const userId = (currentStats as any).userId || (currentStats as any)._id;

    this.http.post<CharacterStats>(`${this.gameUrl}/stats/exchange`, { userId, goldAmount })
      .subscribe({
        next: (updatedStats) => {
          this.stats.set(updatedStats);
          this.gameAlertMessage.set('');
        },
        error: (err) => this.gameAlertMessage.set(err.error?.error || 'Exchange process error.')
      });
  }

  updateCharacterName(newName: string) {
    const currentStats = this.stats();
    const userId = (currentStats as any).userId || (currentStats as any)._id;

    return this.http.put<CharacterStats>(`${this.gameUrl}/stats/name`, { userId, name: newName }).pipe(
      tap(updatedStats => {
        this.stats.set(updatedStats);
      })
    );
  }

  deleteProfileRecord() {
    const currentStats = this.stats();
    const userId = (currentStats as any).userId || (currentStats as any)._id;
    return this.http.delete(`${this.gameUrl}/auth/account/${userId}`);
  }
}
