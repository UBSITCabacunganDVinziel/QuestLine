import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService } from '../quest-service';

@Component({
  selector: 'app-quest-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="list-container" *ngIf="state.currentUser()">
      
      <!-- ONGOING QUEUED BOARD -->
      <h3>⚔️ Ongoing Quest Targets</h3>
      <div class="quest-card active" *ngFor="let q of activeQuests()">
        <div>
          <span class="badge">{{ q.category }}</span>
          <h4>{{ q.title }}</h4>
          <p>{{ q.description }}</p>
          <small *ngIf="q.startTime">⏰ Time: {{ q.startTime }} </small>
          <small *ngIf="q.durationMinutes">⏳ Duration: {{ q.durationMinutes }} mins</small>
        </div>
        <button class="complete-btn" (click)="state.completeQuest(q.id)">Complete (+{{ q.goldReward }}g)</button>
      </div>
      <p *ngIf="activeQuests().length === 0" class="empty-notice">No active targets found on the guild boards.</p>

      <!-- UNLOCKED CLEAN HISTORY BOARD -->
      <h3>🏆 Finished History Board</h3>
      <div class="quest-card finished-log" *ngFor="let q of historicalQuests()">
        <div>
          <h4>✅ {{ q.title }}</h4>
          <p class="status-text">Completed successfully!</p>
          <small class="reward-text">💰 Reward claimed: +{{ q.xpReward }} XP & +{{ q.goldReward }} Gold</small>
        </div>
      </div>
      <p *ngIf="historicalQuests().length === 0" class="empty-notice">No finished items found in the archive yet.</p>
    </div>
  `
})
export class QuestList {
  state = inject(QuestService);

  activeQuests = computed(() => this.state.userQuests().filter(q => !q.isCompleted));
  historicalQuests = computed(() => this.state.userQuests().filter(q => q.isCompleted));
}
