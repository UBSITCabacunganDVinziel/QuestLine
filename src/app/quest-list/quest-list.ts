import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-sevice'; 
import { QuestPayload } from '../../quest.model';    
import { CHORE_LIST } from '../../quest.model';      

@Component({
  selector: 'app-quest-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quest-list.html',
  styleUrl: './quest-list.css'
})
export class QuestList {
  public questService = inject(QuestService);
  public exchangeAmount: number | null = null;

  getChoreMetadata(choreId: string) {
    return CHORE_LIST.find((c) => c.id === choreId) || {
      id: 'unknown',
      name: 'Unknown Quest Assignment',
      category: 'Daily Maintenance',
      difficulty: 'EASY'
    };
  }

  triggerGoldExchange() {
    if (this.exchangeAmount && this.exchangeAmount > 0) {
      this.questService.exchangeGoldToPhp(this.exchangeAmount);
      this.exchangeAmount = null; 
    }
  }

  trackById(index: number, item: QuestPayload) {
    return item.id;
  }
}