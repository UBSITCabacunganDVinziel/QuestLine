import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-sevice';

@Component({
  selector: 'app-quest-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quest-form.html',
  styleUrl: './quest-form.css'
})
export class QuestForm {
  private questService = inject(QuestService);

  // Form fields bound via ngModel
  public title = '';
  public description = '';
  public difficulty: 'Easy' | 'Medium' | 'Hard' = 'Easy';

  onSubmit() {
    if (this.title.trim() && this.description.trim()) {
      // Send data to the state manager
      this.questService.addQuest(
        this.title.trim(),
        this.description.trim(),
        this.difficulty
      );

      // Reset form controls for the next quest entry
      this.title = '';
      this.description = '';
      this.difficulty = 'Easy';
    }
  }
}
