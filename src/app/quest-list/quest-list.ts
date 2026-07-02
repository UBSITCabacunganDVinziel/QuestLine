import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService } from '../quest-service';

@Component({
  selector: 'app-quest-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="list-container" *ngIf="state.currentUser()">
      <!-- ACTIVE TASKS LIST -->
      <h3>⚔️ Ongoing Quest Targets</h3>
      <div class="quest-card active" *ngFor="let q of activeQuests()">
        <div>
          <span class="badge">{{ q.category }}</span>
          <h4>{{ q.title }}</h4>
          <p>{{ q.description }}</p>
          <small *ngIf="q.startTime">⏰ Starts: {{ q.startTime }} </small>
          <small *ngIf="q.durationMinutes">⏳ Limit: {{ q.durationMinutes }} mins</small>
        </div>
        <button class="complete-btn" (click)="state.completeQuest(q.id)">Complete (+{{ q.goldReward }}g)</button>
      </div>
      <p *ngIf="activeQuests().length === 0" style="color: #777;">No active targets found on the guild boards.</p>

      <!-- FINISHED & LOCKED BOARD VIEW -->
      <h3 style="margin-top: 40px; color: #ff5555;">🔒 Finished & Locked History Board</h3>
      <div class="quest-card locked" *ngFor="let q of lockedQuests()">
        <div>
          <h4><del>{{ q.title }}</del></h4>
          <p style="color: #666;">Earned +{{ q.xpReward }} XP & +{{ q.goldReward }} Gold</p>
        </div>
        <span class="lock-timer">🔒 Locked until midnight</span>
      </div>
      <p *ngIf="lockedQuests().length === 0" style="color: #777;">No completed items locked out for today yet.</p>
    </div>
  `
})
export class QuestListComponent {
  state = inject(QuestService);

  // Deriving state reactivity using Computed properties
  activeQuests = computed(() => this.state.userQuests().filter(q => !q.isCompleted));
  lockedQuests = computed(() => this.state.userQuests().filter(q => q.isCompleted));
}
