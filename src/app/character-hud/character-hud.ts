import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService } from '../quest-service';

@Component({
  selector: 'app-character-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hud" *ngIf="state.currentUser() as hero">
      <div class="profile-header">
        <h2>🛡️ Hero: {{ hero.username }} (Lv. {{ hero.level }})</h2>
        <div>
          <button class="btn-warn" (click)="state.logout()">Logout</button>
          <button class="btn-danger" (click)="deleteAccount()">Retire Profile</button>
        </div>
      </div>
      <div class="bars">
        <p>✨ <strong>XP:</strong> {{ hero.xp }} / 100</p>
        <p>🪙 <strong>Gold stash:</strong> {{ hero.gold }}g <small style="color: #aaa;">(Est. Value: ${(hero.gold * 0.05).toFixed(2)})</small></p>
      </div>
    </div>
  `
})
export class CharacterHudComponent {
  state = inject(QuestService);

  deleteAccount() {
    if (confirm("Are you sure you want to permanently erase this profile? All saved items disappear.")) {
      this.state.deleteAccount();
    }
  }
}
