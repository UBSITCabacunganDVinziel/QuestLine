import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-sevice';
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

  onSubmit() {
    if (!this.selectedChoreId) return;

    if (this.questService.isChoreLocked(this.selectedChoreId)) {
      this.questService.gameAlertMessage.set("This objective selection is locked under cooldown parameters!");
      return;
    }

    this.questService.addQuest(this.selectedChoreId);
    this.selectedChoreId = '';
  }
}
