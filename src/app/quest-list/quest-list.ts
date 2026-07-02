import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-service'; 
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

  public isEditingName = false;
  public newName = '';

  getChoreMetadata(choreId: string) {
    return CHORE_LIST.find((c) => c.id === choreId) || {
      id: 'unknown',
      name: 'Unknown Quest Assignment',
      category: 'Daily Maintenance',
      difficulty: 'EASY'
    };
  }

  saveHeroName() {
    if (!this.newName.trim()) return;
    this.questService.updateCharacterName(this.newName.trim()).subscribe({
      next: () => {
        this.isEditingName = false;
      }
    });
  }

  deleteHeroAccount() {
    const doubleCheck = confirm("Are you absolute sure you want to delete this profile? All saved records will be wiped!");
    if (!doubleCheck) return;

    this.questService.deleteProfileRecord().subscribe({
      next: () => {
        alert("Character record(s) wiped. Returning to Gateway login.");
        this.questService.logoutPlayer();
      }
    });
  }

  triggerGoldExchange() {
    if (this.exchangeAmount !== null && this.exchangeAmount <= 0) {
      this.questService.gameAlertMessage.set("Exchange quantity error: Input must be greater than zero!");
      this.exchangeAmount = null;
      return;
    }

    if (this.exchangeAmount && this.exchangeAmount > this.questService.stats().gold) {
      this.questService.gameAlertMessage.set("Insufficient gold inside inventory bag!");
      this.exchangeAmount = null;
      return;
    }

    if (this.exchangeAmount && this.exchangeAmount > 0) {
      this.questService.exchangeGoldToPhp(this.exchangeAmount);
      this.exchangeAmount = null; 
    }
  }

  trackById(index: number, item: QuestPayload) {
    return item.id;
  }
}