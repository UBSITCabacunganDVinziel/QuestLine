import { Injectable, signal, computed } from '@angular/core';
import { Quest, UserAccount } from './quest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  currentUser = signal<UserAccount | null>(null);
  userQuests = signal<Quest[]>([]);

  constructor() {
    this.checkSession();
  }

  signUp(username: string, password: string): boolean {
    const existing = localStorage.getItem(`questline_user_${username}`);
    if (existing || !username.trim() || !password.trim()) return false;

    const newAccount: UserAccount = { username, password, xp: 0, gold: 0, level: 1 };
    localStorage.setItem(`questline_user_${username}`, JSON.stringify(newAccount));
    return true;
  }

  signIn(username: string, password: string): boolean {
    const data = localStorage.getItem(`questline_user_${username}`);
    if (!data) return false;

    const user: UserAccount = JSON.parse(data);
    if (user.password !== password) return false;

    localStorage.setItem('questline_active_session', username);
    this.currentUser.set(user);
    this.loadQuests(username);
    return true;
  }

  logout() {
    localStorage.removeItem('questline_active_session');
    this.currentUser.set(null);
    this.userQuests.set([]);
  }

  deleteAccount() {
    const user = this.currentUser();
    if (user) {
      localStorage.removeItem(`questline_user_${user.username}`);
      localStorage.removeItem(`questline_quests_${user.username}`);
      this.logout();
    }
  }

  private checkSession() {
    const activeUser = localStorage.getItem('questline_active_session');
    if (activeUser) {
      const data = localStorage.getItem(`questline_user_${activeUser}`);
      if (data) {
        this.currentUser.set(JSON.parse(data));
        this.loadQuests(activeUser);
      }
    }
  }

  private loadQuests(username: string) {
    const saved = localStorage.getItem(`questline_quests_${username}`);
    let items: Quest[] = saved ? JSON.parse(saved) : [];

    const now = new Date().getTime();
    items = items.map(q => {
      if (q.lockedUntil && now > new Date(q.lockedUntil).getTime()) {
        return { ...q, isCompleted: false, lockedUntil: undefined };
      }
      return q;
    });

    this.userQuests.set(items);
    this.saveQuests();
  }

  addCustomQuest(quest: Omit<Quest, 'id' | 'isCompleted' | 'xpReward' | 'goldReward'>) {
    const fullQuest: Quest = {
      ...quest,
      id: crypto.randomUUID(),
      xpReward: Math.floor(Math.random() * 30) + 20, 
      goldReward: Math.floor(Math.random() * 15) + 5, 
      isCompleted: false
    };

    this.userQuests.update(q => [...q, fullQuest]);
    this.saveQuests();
  }

  completeQuest(id: string) {
    const user = this.currentUser();
    if (!user) return;

    const resetTime = new Date();
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);

    this.userQuests.update(quests =>
      quests.map(q => {
        if (q.id === id) {
          let newXp = user.xp + q.xpReward;
          let newLevel = user.level;

          if (newXp >= 100) {
            newLevel += Math.floor(newXp / 100);
            newXp = newXp % 100;
          }

          const updatedUser = { ...user, xp: newXp, gold: user.gold + q.goldReward, level: newLevel };
          this.currentUser.set(updatedUser);
          localStorage.setItem(`questline_user_${user.username}`, JSON.stringify(updatedUser));

          return { ...q, isCompleted: true, lockedUntil: resetTime.toISOString() };
        }
        return q;
      })
    );
    this.saveQuests();
  }

  private saveQuests() {
    const user = this.currentUser();
    if (user) {
      localStorage.setItem(`questline_quests_${user.username}`, JSON.stringify(this.userQuests()));
    }
  }
}
