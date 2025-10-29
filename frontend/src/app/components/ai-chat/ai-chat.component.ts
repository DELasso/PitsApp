import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../../services/ai-chat.service';
import { ChatMessage, ChatResponse } from '../../models/chat.model';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.scss'],
})
export class AiChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  userMessage: string = '';
  isLoading: boolean = false;
  isOpen: boolean = false;
  private shouldScroll: boolean = false;

  constructor(private aiChatService: AiChatService) {}

  ngOnInit(): void {
    // Mensaje de bienvenida
    this.addBotMessage(
      '¡Hola! Soy tu asistente virtual de PitsApp. ¿En qué puedo ayudarte hoy? Puedo ayudarte a encontrar servicios automotrices, talleres o repuestos.'
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading) {
      return;
    }

    const message = this.userMessage.trim();
    this.addUserMessage(message);
    this.userMessage = '';
    this.isLoading = true;

    this.aiChatService.sendMessage(message, this.messages).subscribe({
      next: (response) => {
        if (response.success && response.response) {
          this.addBotMessage(response.response);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        this.addBotMessage(
          'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.'
        );
        this.isLoading = false;
      },
    });
  }

  private addUserMessage(content: string): void {
    this.messages.push({
      role: 'user',
      content,
      timestamp: new Date(),
    });
    this.shouldScroll = true;
  }

  private addBotMessage(content: string): void {
    this.messages.push({
      role: 'assistant',
      content,
      timestamp: new Date(),
    });
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
