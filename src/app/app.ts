import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestForm } from './quest-form/quest-form';
import { QuestList } from './quest-list/quest-list';
import { SignIn } from './sign-in/sign-in';
import { SignUp } from './sign-up/sign-up';
import { QuestService } from './quest-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, QuestForm, QuestList, SignIn, SignUp],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public questService = inject(QuestService);
  
  public currentAuthSubPage = signal<'signin' | 'signup'>('signin');

  navigateToPage(page: 'signin' | 'signup') {
    this.currentAuthSubPage.set(page);
  }

  deleteHeroAccountDirectly() {
    const check = confirm("WARNING: Are you sure you want to permanently delete your profile record from MongoDB? This action cannot be undone!");
    if (!check) return;

    this.questService.deleteProfileRecord().subscribe({
      next: () => {
        alert("Account wiped successfully. Returning to login gateway.");
        this.questService.logoutPlayer();
      },
      error: (err) => {
        console.error('Account deletion failed:', err);
        this.questService.logoutPlayer();
      }
    });
  }
}
