import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService } from '../quest-sevice';
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

  getChoreMetadata(choreId: string) {
    return CHORE_LIST.find((c: any) => c.id === choreId);
  }

  trackById(index: number, item: QuestPayload) {
    return item.id;
  }
}
