import { Component, signal } from '@angular/core';
import { QuestForm } from './quest-form/quest-form';
import { QuestList } from './quest-list/quest-list';

@Component({
  selector: 'app-root',
  imports: [QuestForm, QuestList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('questline-app');
}