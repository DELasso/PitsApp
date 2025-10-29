import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatMessage, ChatResponse, ServiceAnalysis } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class AiChatService {
  private apiUrl = `${environment.apiUrl}/ai-chat`;

  constructor(private http: HttpClient) {}

  /**
   * Envía un mensaje al chat de IA
   */
  sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/message`, {
      message,
      conversationHistory: conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });
  }

  /**
   * Analiza las necesidades del usuario
   */
  analyzeNeeds(description: string): Observable<{ success: boolean; analysis: ServiceAnalysis }> {
    return this.http.post<{ success: boolean; analysis: ServiceAnalysis }>(
      `${this.apiUrl}/analyze-needs`,
      { description }
    );
  }

  /**
   * Obtiene recomendaciones de talleres
   */
  recommendWorkshops(
    serviceType: string,
    location: string
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/recommend-workshops`, {
      serviceType,
      location,
    });
  }
}
