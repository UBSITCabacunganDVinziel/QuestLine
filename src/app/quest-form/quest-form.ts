import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-service';
import { CHORE_LIST, ChoreObjective, REWARD_TIERS } from '../../quest.model';

@Component({
  selector: 'app-quest-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quest-form.html',
  styleUrl: './quest-form.css'
})
export class QuestForm {
  public questService = inject(QuestService);
  public selectedChoreId = '';
  public rewardTiers = REWARD_TIERS;

  getChoresByCategory(category: 'Daily Maintenance' | 'Mental & Physical' | 'Deep Focus & Admin' | 'Epic Feats'): ChoreObjective[] {
    return CHORE_LIST.filter((c) => c.category === category);
  }

  getSelectedChoreMetadata(): ChoreObjective | undefined {
    return CHORE_LIST.find((c) => c.id === this.selectedChoreId);
  }

  onChoreSelect(event: Event) {
    const element = event.target as HTMLSelectElement;
    this.selectedChoreId = element.value;
  }

  onSubmit() {
    if (!this.selectedChoreId) return;

    if (this.questService.isChoreLocked(this.selectedChoreId)) {
      this.questService.gameAlertMessage.set("This objective selection is locked under cooldown parameters!");
      return;
    }

    this.questService.addQuest(this.selectedChoreId);
    this.selectedChoreId = '';

    const dropdownElement = document.getElementById('choreSelect') as HTMLSelectElement;
    if (dropdownElement) dropdownElement.value = '';

    if (typeof (this.questService as any).fetchActiveQuestsFromServer === 'function') {
      (this.questService as any).fetchActiveQuestsFromServer();
    } else if (typeof (this.questService as any).loadQuests === 'function') {
      (this.questService as any).loadQuests();
    }
  }

  postQuestDirectly() {
    this.onSubmit();
  }
}
