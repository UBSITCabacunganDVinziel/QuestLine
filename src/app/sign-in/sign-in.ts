import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-box" *ngIf="!authService.currentUser()">
      <h3>🔓 Enter QuestLine Kingdom</h3>
      <input type="text" [(ngModel)]="username" placeholder="Hero Name" />
      <input type="password" [(ngModel)]="password" placeholder="Secret Key" />
      <button (click)="login()">Authenticate Session</button>
    </div>
  `
})
export class SignInComponent {
  authService = inject(QuestService);
  username = ''; password = '';

  login() {
    if (!this.authService.signIn(this.username, this.password)) {
      alert('Invalid Hero identity matching credentials.');
    }
  }
}
