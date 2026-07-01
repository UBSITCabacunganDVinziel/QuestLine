import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestForm } from './quest-form/quest-form';
import { QuestList } from './quest-list/quest-list';
import { SignIn } from './sign-in/sign-in';
import { SignUp } from './sign-up/sign-up';
import { QuestService } from './quest-service';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

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
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient()
  ]
}