import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-service';
import { Quest } from '../quest.model';

@Component({
  selector: 'app-quest-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container" *ngIf="state.currentUser()">
      <h3>📖 Universal Starter Quests Board</h3>
      <div class="preset-grid">
        <div class="preset-card" *ngFor="let p of presets">
          <strong>{{ p['title'] }}</strong><br><small>{{ p['description'] }}</small>
          <button (click)="addPreset(p)">Add to Tracker</button>
        </div>
      </div>

      <hr style="margin: 20px 0; border: 1px solid #444;">

      <h3>✍️ Inscribe Custom Quest Objective</h3>
      <input type="text" [(ngModel)]="customTitle" placeholder="Objective name..." />
      <input type="text" [(ngModel)]="customDesc" placeholder="Description details..." />
      <select [(ngModel)]="customCategory">
        <option value="Vitality">❤️ Vitality (Health/Fitness)</option>
        <option value="Mind/Focus">🧠 Mind/Focus (Mental Development)</option>
        <option value="Guild Chores">🧹 Guild Chores (Errands/Cleaning)</option>
        <option value="Social/Charisma">🤝 Social/Charisma (Connections)</option>
        <option value="Rest/Recovery">🧘 Rest/Recovery (Self-Care)</option>
      </select>
      
      <div class="time-inputs">
        <label>Execute Time: <input type="time" [(ngModel)]="customTime" /></label>
        <label>Duration: <input type="number" [(ngModel)]="customDuration" placeholder="Minutes" /></label>
      </div>
      <button (click)="createCustom()">Deploy Active Quest</button>
    </div>
  `
})
export class QuestForm {
  state = inject(QuestService);
  
  customTitle = ''; customDesc = ''; customTime = ''; customDuration?: number;
  customCategory: Quest['category'] = 'Vitality';

  presets: Omit<Quest, 'id' | 'isCompleted'>[] = [
    { title: 'Hydration Challenge', description: 'Consume 2L of water throughout today.', category: 'Vitality', xpReward: 25, goldReward: 5 },
    { title: 'Clear the Sanctuary', description: 'Dedicate time to clean and organize your immediate workspace or room.', category: 'Guild Chores', xpReward: 35, goldReward: 10 },
    { title: 'Digital Sabbatical', description: 'Disconnect completely from entertaining social apps for an uninterrupted hour.', category: 'Mind/Focus', xpReward: 40, goldReward: 12 },
    { title: 'Kinship Check-in', description: 'Reach out, message, or call a family member or friend to maintain social ties.', category: 'Social/Charisma', xpReward: 20, goldReward: 5 },
    { title: 'Mindful Decompression', description: 'Engage in 10 minutes of controlled breathing or stretching away from screens.', category: 'Rest/Recovery', xpReward: 25, goldReward: 8 }
  ];

  addPreset(preset: any) {
    this.state.addCustomQuest({
      title: preset['title'],
      description: preset['description'],
      category: preset['category'],
      startTime: '08:00',
      durationMinutes: 30
    });
  }

  createCustom() {
    if (!this.customTitle.trim()) return;
    this.state.addCustomQuest({
      title: this.customTitle,
      description: this.customDesc,
      category: this.customCategory,
      startTime: this.customTime || undefined,
      durationMinutes: this.customDuration || undefined
    });
    this.customTitle = ''; this.customDesc = '';
  }
}
