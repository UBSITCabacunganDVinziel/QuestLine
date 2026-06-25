import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService } from '../quest-sevice';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-character-hud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-hud.ts.html',
  styleUrl: './character-hud.css'
})
export class CharacterHudComponent {
  public questService = inject(QuestService);
  public isEditingName = false;
  public editNameValue = '';

  startEditing() {
    this.editNameValue = this.questService.stats().name;
    this.isEditingName = true;
  }

  saveName() {
    if (this.editNameValue.trim()) {
      this.questService.updateCharacterName(this.editNameValue.trim());
    }
    this.isEditingName = false;
  }

  getXpPercentage(): number {
    const stats = this.questService.stats();
    return (stats.currentXp / stats.nextLevelXp) * 100;
  }
}