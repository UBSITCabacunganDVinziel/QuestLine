import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-service';
import { Quest } from '../quest.model';

interface PresetCategory {
  categoryName: string;
  badgeIcon: string;
  quests: Omit<Quest, 'id' | 'isCompleted'>[];
}

@Component({
  selector: 'app-quest-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container" *ngIf="state.currentUser()">
      <h2>📜 Guild Quest Catalogs</h2>
      
      <!-- CATEGORIZED PRESET VIEWS -->
      <div *ngFor="let cat of categorizedPresets" class="category-block">
        <h3 class="category-title">{{ cat.badgeIcon }} {{ cat.categoryName }}</h3>
        
        <div class="preset-grid">
          <div class="preset-card" *ngFor="let p of cat.quests">
            <div class="preset-info">
              <strong>{{ p['title'] }}</strong>
              <small>{{ p['description'] }}</small>
            </div>
            
            <button 
              [disabled]="isQuestActive(p['title'])" 
              class="accept-btn"
              (click)="addPreset(p)">
              {{ isQuestActive(p['title']) ? '🛡️ Active' : 'Accept' }}
            </button>
          </div>
        </div>
      </div>

      <hr>

      <!-- CUSTOM QUEST BUILDER -->
      <h3>✍️ Forge a Custom Quest Objective</h3>
      <input type="text" [(ngModel)]="customTitle" placeholder="Objective Name..." />
      <input type="text" [(ngModel)]="customDesc" placeholder="Description Details..." />
      
      <select [(ngModel)]="customCategory">
        <option value="Guild Chores">🧹 Guild Chores (Errands/Cleaning)</option>
        <option value="Mind/Focus">🧠 School Quests (Study/Learning)</option>
        <option value="Vitality">⚔️ Work Campaigns (Professional Tasks)</option>
        <option value="Social/Charisma">🤝 Social/Charisma (Connections)</option>
        <option value="Rest/Recovery">🧘 Rest/Recovery (Self-Care)</option>
      </select>
      
      <div class="time-inputs">
        <label>Time: <input type="time" [(ngModel)]="customTime" /></label>
        <label>Duration: <input type="number" [(ngModel)]="customDuration" placeholder="Mins" /></label>
      </div>
      
      <button class="deploy-btn" [disabled]="isQuestActive(customTitle)" (click)="createCustom()">
        {{ isQuestActive(customTitle) ? '🔒 Quest Already Enlisted' : 'Deploy Active Quest' }}
      </button>
    </div>
  `
})
export class QuestForm {
  state = inject(QuestService);
  
  customTitle = ''; customDesc = ''; customTime = ''; customDuration?: number;
  customCategory: Quest['category'] = 'Guild Chores';

  categorizedPresets: PresetCategory[] = [
    {
      categoryName: 'Daily Chores',
      badgeIcon: '🧹',
      quests: [
        { title: 'Clear the Sanctuary', description: 'Clean and organize your workspace or bedroom.', category: 'Guild Chores', xpReward: 30, goldReward: 5 },
        { title: 'Hydration Protocol', description: 'Drink a full glass of water right now.', category: 'Guild Chores', xpReward: 15, goldReward: 2 },
        { title: 'Inventory Restock', description: 'Organize or throw away expired items from your bag or fridge.', category: 'Guild Chores', xpReward: 25, goldReward: 4 }
      ]
    },
    {
      categoryName: 'School Quests',
      badgeIcon: '🧠',
      quests: [
        { title: 'Deep Focus Study', description: 'Review your lesson notes for 25 continuous minutes.', category: 'Mind/Focus', xpReward: 40, goldReward: 8 },
        { title: 'Reading Campaign', description: 'Read 5 pages of a textbook or informative article.', category: 'Mind/Focus', xpReward: 30, goldReward: 6 },
        { title: 'Brainstorm Session', description: 'Outline a project concept or script layout.', category: 'Mind/Focus', xpReward: 35, goldReward: 7 }
      ]
    },
    {
      categoryName: 'Work Campaigns',
      badgeIcon: '⚔️',
      quests: [
        { title: 'Inbox Purge', description: 'Review and clear pending urgent messages and notices.', category: 'Vitality', xpReward: 25, goldReward: 5 },
        { title: 'Task Optimization', description: 'Plan and list down the day\'s top 3 high-priority objectives.', category: 'Vitality', xpReward: 20, goldReward: 4 },
        { title: 'Skill Grinding', description: 'Spend 20 minutes practicing tool shortcuts or coding rules.', category: 'Vitality', xpReward: 45, goldReward: 10 }
      ]
    }
  ];

  isQuestActive(title: string): boolean {
    if (!title) return false;
    return this.state.userQuests().some(q => q.title.toLowerCase() === title.toLowerCase() && !q.isCompleted);
  }

  addPreset(preset: any) {
    this.state.addCustomQuest({
      title: preset['title'],
      description: preset['description'],
      category: preset['category'],
      startTime: '09:00',
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
