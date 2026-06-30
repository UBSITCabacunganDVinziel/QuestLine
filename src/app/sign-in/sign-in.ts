import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-sevice';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-in.html'
})
export class SignIn {
  private questService = inject(QuestService);
  
  public username = '';
  public password = '';
  
  onSwitchToSignUp = output<void>();

  onSignIn() {
    if (!this.username || !this.password) return;
    this.questService.signInPlayer({ username: this.username, password: this.password });
  }
}