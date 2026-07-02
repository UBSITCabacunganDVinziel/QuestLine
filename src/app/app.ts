import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService } from './quest-service';
import { CharacterHudComponent } from './character-hud/character-hud.component';
import { QuestFormComponent } from './quest-form/quest-form.component';
import { QuestListComponent } from './quest-list/quest-list.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    CharacterHudComponent, 
    QuestFormComponent, 
    QuestListComponent, 
    SignInComponent, 
    SignUpComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
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
