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

  onClaimQuest(questId: string, choreId: string) {
    const metadata = this.getChoreMetadata(choreId);
    const difficultyKey = metadata.difficulty || 'EASY';
    this.questService.completeQuest(questId, difficultyKey);
  }

  startEditingName() {
    this.newName = this.questService.stats().name || '';
    this.isEditingName = true;
  }

  // FIXED INTERFACE LINK: Subscribes explicitly to trigger the backend PUT query pipeline execution
  saveHeroName(updatedName: string) {
    if (!updatedName.trim()) return;
    this.questService.updateCharacterName(updatedName.trim()).subscribe({
      next: () => {
        this.isEditingName = false;
      },
      error: (err) => {
        console.error('Character renaming network transmission failure:', err);
        this.isEditingName = false;
      }
    });
  }

  // NEW INTERFACE BINDING: Implements the gold currency wallet transaction pipeline
  triggerGoldExchange(inputElement: HTMLInputElement) {
    const amount = parseInt(inputElement.value, 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Please state a valid positive value of gold coins.');
      return;
    }
    if (amount > this.questService.stats().gold) {
      alert('Insufficient gold remaining inside character wallet storage records.');
      return;
    }
    this.questService.exchangeGoldToPhp(amount);
    inputElement.value = '';
  }

  deleteHeroAccount() {
    const doubleCheck = confirm("Are you absolutely sure you want to delete this profile? All saved data records inside MongoDB will be lost.");
    if (doubleCheck) {
      this.questService.deleteProfileRecord().subscribe({
        next: () => {
          alert('Profile wiped.');
          this.questService.logoutPlayer();
        }
      });
    }
  }
}
