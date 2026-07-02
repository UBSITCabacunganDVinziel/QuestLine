import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService } from '../quest-service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-box" *ngIf="!authService.currentUser()">
      <h3>⚔️ Create Character Profile</h3>
      <input type="text" [(ngModel)]="username" placeholder="Hero Name" />
      <input type="password" [(ngModel)]="password" placeholder="Secure Secret Key" />
      <button (click)="register()">Establish Profile</button>
      <p style="color: green" *ngIf="msg">{{msg}}</p>
    </div>
  `
})
export class SignUp {
  authService = inject(QuestService);
  username = ''; password = ''; msg = '';

  register() {
    if(this.authService.signUp(this.username, this.password)) {
      this.msg = 'Character registered! Proceed to Sign In.';
      this.username = ''; this.password = '';
    } else {
      this.msg = 'Name occupied or invalid!';
    }
  }
}
