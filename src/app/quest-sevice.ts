import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quest } from '../models/quest.model';

@Injectable({
  providedIn: 'root'
})
export class QuestSevice {
  private apiUrl = 'http://localhost:5000/api/quests';

  constructor(private http: HttpClient) {}

  getQuests(): Observable<Quest[]> {
    return this.http.get<Quest[]>(this.apiUrl);
  }

  addQuest(quest: Quest): Observable<Quest> {
    return this.http.post<Quest>(this.apiUrl, quest);
  }

  updateQuest(id: string, quest: Quest): Observable<Quest> {
    return this.http.put<Quest>(${this.apiUrl}/${id}, quest);
  }

  deleteQuest(id: string): Observable<any> {
    return this.http.delete(${this.apiUrl}/${id});
  }
}