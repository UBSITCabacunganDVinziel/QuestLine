import { Component } from '@angular/core';
import { CharacterHud } from './character-hud/character-hud';
import { QuestList } from './quest-list/quest-list';
import { QuestForm } from './quest-form/quest-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CharacterHud, QuestForm, QuestList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'questline';
}