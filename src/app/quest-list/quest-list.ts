import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService } from '../services/quest.service';
import { QuestPayload } from '../quest.model';
import { CHORE_LIST } from '../quest.model';

@Component({
  selector: 'app-quest-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quest-list.component.html',
  styleUrl: './quest-list.component.css'
})
export class QuestList {
  public questService = inject(QuestService);

  getChoreMetadata(choreId: string) {
    return CHORE_LIST.find((c) => c.id === choreId) || {
      id: 'unknown',
      name: 'Unknown Quest Assignment',
      category: 'Daily Maintenance',
      difficulty: 'EASY'
    };
  }

  trackById(index: number, item: QuestPayload) {
    return item.id; 
  }
}