import { Component, OnDestroy, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { min, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ChatService } from '../chat.service';
import { User } from '../user';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  //div reference
  @ViewChild('chatWindow') div: ElementRef<HTMLDivElement> = {} as ElementRef<HTMLDivElement>;

  private getMessagesSub: Subscription | undefined;
  placeholderText: string = "Type message or desired nickname";
  currentTextInput: string = "";
  toggled: boolean = false;
  messages: string[] = [];
  user: User = {} as User;


  constructor(public chatService: ChatService, private renderer: Renderer2, private elemRef: ElementRef) { }

  updateScrollAttribute(): void {
    setTimeout(() => {
      let scrollHeight: any = (this.div.nativeElement.scrollHeight);
      this.renderer.setProperty(this.div.nativeElement, 'scrollTop', scrollHeight);
    }, 0);
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
      this.chatService.cutOffTyping();
      this.toggled = true;
      this.user.nickName = this.currentTextInput;
      this.currentTextInput = "";
      this.placeholderText = "";
      this.chatService.updateUsername(this.user);
    }
  }

  setOffTyping(): void {
    if (this.currentTextInput === "")
      this.chatService.cutOffTyping();
    else
      this.chatService.setOffTyping();
  }

  getDateStamp(serverDate: any): string {
    //Server date in milliseconds
    let date = new Date(Date.parse(serverDate)).getTime();
    //Offset (Converting minutes to milliseconds) Note: Take away 14400000 because server is in another country
    let offset = (new Date().getTimezoneOffset() * 60 * 1000) - 14400000;
    //Client date
    let convertedDate = new Date(date + offset);
    let hours = convertedDate.getHours();
    if (hours > 12)
      hours -= 12;
    return `${String(hours).padStart(2, '0')}:${String(convertedDate.getMinutes()).padStart(2, '0')}`;
  }

  ngOnInit(): void {
    this.user = {
      nickName: "",
      message: ""
    }
    this.getMessagesSub = this.chatService.subject.subscribe((data: any) => {
      if (data.tempUsername)
        this.user.nickName = data.tempUsername;
      else {
        let tempDiv = this.renderer.createElement('div');
        let insert = '';
        if (data.serverDate) {
          let dateStamp = this.getDateStamp(data.serverDate);
          if (data.nickName === this.user.nickName)
            insert = `style="color:#009cfd;"`
          this.renderer.setProperty(tempDiv, 'innerHTML', `<strong>${dateStamp}</strong><span ${insert}> ${data.message}</span>`);
        }
        else {
          this.renderer.setProperty(tempDiv, 'innerHTML', ` ${data.message}`)
        }
        this.renderer.appendChild(this.div.nativeElement, tempDiv);

        /*every time we get a message, we call the function that updates the attribute. SetTimeout is required to get
        the correct scrollHeight of the div*/
        this.updateScrollAttribute();
      }
    })
  }

  ngOnDestroy(): void {
    this.getMessagesSub?.unsubscribe();
  }
}
