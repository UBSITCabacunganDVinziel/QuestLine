import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService } from '../quest-service'; 
import { QuestPayload } from '../../quest.model';    
import { CHORE_LIST } from '../../quest.model';      

@Component({
  selector: 'app-quest-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quest-list.html',
  styleUrl: './quest-list.css'
})
export class QuestList {
  public questService = inject(QuestService);

  public isEditingName = false;
  public newName = '';

  getChoreMetadata(choreId: string) {
    return CHORE_LIST.find((c) => c.id === choreId) || {
      id: 'unknown',
      name: 'Unknown Quest Assignment',
      category: 'Daily Maintenance' as const,
      difficulty: 'EASY' as const
    };
  }

  startEditingName() {
    this.newName = this.questService.stats().name;
    this.isEditingName = true;
  }

  saveHeroName(updatedName: string) {
    if (!updatedName.trim()) return;
    this.questService.updateCharacterName(updatedName.trim()).subscribe({
      next: () => {
        this.isEditingName = false;
      }
    });
  }

  deleteHeroAccount() {
    const doubleCheck = confirm("Are you absolutely sure you want to delete this profile? All saved data records inside MongoDB will be wiped!");
    if (!doubleCheck) return;

    this.questService.deleteProfileRecord().subscribe({
      next: () => {
        alert("Character data wiped. Returning to Gateway login.");
        this.questService.logoutPlayer();
      }
    });
  }

  triggerGoldExchange(inputElement: HTMLInputElement) {
    const amountValue = inputElement.value ? parseInt(inputElement.value) : 0;

    if (amountValue <= 0) {
      this.questService.gameAlertMessage.set("Exchange quantity error: Input must be greater than zero!");
      inputElement.value = '';
      return;
    }

    if (amountValue > this.questService.stats().gold) {
      this.questService.gameAlertMessage.set("Insufficient gold inside inventory bag!");
      inputElement.value = '';
      return;
    }

    this.questService.exchangeGoldToPhp(amountValue);
    inputElement.value = ''; 
  }

  trackById(index: number, item: QuestPayload) {
    return item.id;
  }
}
