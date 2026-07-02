import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService } from './quest-service';
import { CharacterHud } from './character-hud/character-hud';
import { QuestForm } from './quest-form/quest-form';
import { QuestList } from './quest-list/quest-list';
import { SignIn } from './sign-in/sign-in';
import { SignUp } from './sign-up/sign-up';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    CharacterHud, 
    QuestForm, 
    QuestList, 
    SignIn, 
    SignUp
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App{
  questService = inject(QuestService);

  onDeleteProfile() {
    if (confirm('Are you completely sure you want to delete your profile?')) {
      this.questService.deleteAccount();
    }
  }

  onLogoutPlayer() {
    this.questService.logout();
  }

  handleServiceError() {
    return {
      error: (err: any) => {
        console.error('An internal application state error occured:', err);
        this.questService.logout();
      }
    };
  }
}
