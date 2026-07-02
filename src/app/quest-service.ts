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

  public isAuthenticated = signal<boolean>(localStorage.getItem('ql_auth') === 'true');
  public currentUserToken = signal<string | null>(localStorage.getItem('ql_token'));

  // Default values check localStorage to prevent reverting back to "Guest Player"
  public stats = signal<any>({
    name: localStorage.getItem('ql_name') || 'Guest Player',
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    gold: 0,
    phpBalance: 0,
    avatarSeed: 'QuestLineHero',
    completedChoresToday: {},
    userId: localStorage.getItem('ql_user_id') || null
  });
  
  public quests = signal<QuestPayload[]>([]);
  public gameAlertMessage = signal<string>('');

  constructor() {
    // Automatically re-fetch progress matrix records on boot if authenticated
    const cachedUserId = localStorage.getItem('ql_user_id');
    if (this.isAuthenticated() && cachedUserId) {
      this.loadStatsFromServer(cachedUserId);
      this.loadActiveQuests(cachedUserId);
    }
  }

  signInPlayer(credentials: any) {
    this.http.post<{success: boolean, token?: string, userId: string, username: string}>(`${this.authUrl}/signin`, credentials)
      .subscribe({
        next: (res) => {
          localStorage.setItem('ql_auth', 'true');
          localStorage.setItem('ql_token', res.token || 'mock-token');
          localStorage.setItem('ql_user_id', res.userId);
          localStorage.setItem('ql_name', res.username);

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
    localStorage.clear();
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
        next: (data) => {
          const completeStatsPayload = { ...data, userId: userId };
          localStorage.setItem('ql_name', data.name);
          this.stats.set(completeStatsPayload);
        },
        error: (err) => console.error('Failed to load player statistics matrix data records:', err)
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
    const userId = currentStats.userId || currentStats._id;

    if (!userId) return;

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
          const currentStats = this.stats();
          const userId = currentStats.userId;
          
          const updatedStatsPayload = { ...res.stats, userId: userId };
          this.stats.set(updatedStatsPayload);
          
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
    const userId = currentStats.userId;

    this.http.post<CharacterStats>(`${this.gameUrl}/stats/exchange`, { userId, goldAmount })
      .subscribe({
        next: (updatedStats) => {
          const updatedStatsPayload = { ...updatedStats, userId: userId };
          this.stats.set(updatedStatsPayload);
          this.gameAlertMessage.set('');
        },
        error: (err) => this.gameAlertMessage.set(err.error?.error || 'Exchange process error.')
      });
  }

  updateCharacterName(newName: string) {
    const currentStats = this.stats();
    const userId = currentStats.userId;

    return this.http.put<CharacterStats>(`${this.gameUrl}/stats/name`, { userId, name: newName }).pipe(
      tap(updatedStats => {
        const updatedStatsPayload = { ...updatedStats, userId: userId };
        localStorage.setItem('ql_name', newName);
        this.stats.set(updatedStatsPayload);
      })
    );
  }

  deleteProfileRecord() {
    const currentStats = this.stats();
    const userId = currentStats.userId;
    return this.http.delete(`${this.gameUrl}/auth/account/${userId}`);
  }
}
