import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.html'
})
export class SignUp {
  private questService = inject(QuestService);

  public username = '';
  public email = '';
  public password = '';

  onSwitchToSignIn = output<void>();

  onSignUp() {
    if (!this.username || !this.email || !this.password) return;
    this.questService.signUpPlayer({
      username: this.username,
      email: this.email,
      password: this.password
    });
    this.onSwitchToSignIn.emit();
  }
}