import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CharacterStats, QuestPayload } from './quest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

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
    this.http.post<{token: string, stats: CharacterStats}>(`${this.baseUrl}/auth/signin`, credentials)
      .subscribe({
        next: (res) => {
          this.currentUserToken.set(res.token);
          this.stats.set(res.stats);
          this.isAuthenticated.set(true);
          this.gameAlertMessage.set('Authentication cleared! Loading character ledger...');
          this.loadActiveQuests();
        },
        error: (err) => this.gameAlertMessage.set(err.error?.message || 'Access Denied: Invalid credentials.')
      });
  }

  signUpPlayer(accountData: any) {
    this.http.post<{message: string}>(`${this.baseUrl}/auth/signup`, accountData)
      .subscribe({
        next: () => {
          this.gameAlertMessage.set('Account generated successfully! Proceed to log in.');
        },
        error: (err) => this.gameAlertMessage.set(err.error?.message || 'Registration failed. Try a different username.')
      });
  }

  logoutPlayer() {
    this.isAuthenticated.set(false);
    this.currentUserToken.set(null);
    this.quests.set([]);
  }

  private loadActiveQuests() {
    this.http.get<QuestPayload[]>(`${this.baseUrl}/quests`).subscribe(data => this.quests.set(data));
  }
}