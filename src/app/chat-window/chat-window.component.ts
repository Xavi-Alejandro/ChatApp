import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ChatService } from '../chat.service';
import { User } from '../user';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy {

  private getMessagesSub: Subscription | undefined;
  messages: string[] = [];
  currentTextInput: string = "";
  placeholderText: string = "Type message or desired nickname"
  toggled: boolean = false;

  user: User = {} as User;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.user = {
      nickName: "",
      message: ""
    }

    this.getMessagesSub = this.chatService.subject.subscribe((data: string) => {
      this.messages.push(data);
    })
  }

  sendMessage() {
    if (this.currentTextInput) {
      this.user.message = this.currentTextInput;

      this.currentTextInput = "";
      this.placeholderText = "";

      this.chatService.sendMessage(this.user);
    }
  }

  setUsername() {
    if (this.currentTextInput) {
      this.toggled = true;

      this.user.nickName = this.currentTextInput;
      this.currentTextInput = "";
      this.placeholderText = "";

      this.chatService.updateUsername(this.user);
    }
  }

  ngOnDestroy(): void {
    this.getMessagesSub?.unsubscribe();
  }
}
