import { Injectable } from '@angular/core';
//For client side socket
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  /*An observable, by definition is a data producer. Albeit a special kind that can produce data over time.
 
  A Subject on the other hand can act as both – a data producer and a data consumer.
 
  This implies two things.
  1. A subject can be subscribed to, just like an observable.
  2. A subject can subscribe to other observables.
 
  That being said, there is one critical difference between a subject and an observable.
 
  All subscribers to a subject share the same execution of the subject. i.e. when a subject produces data, all of its subscribers will receive the same data. 
  This behavior is different from observables, where each subscription causes an independent execution of the observable.
  */
  private socket: Socket | undefined; //client instance of socket.io
  public subject: Subject<string> = new Subject();

  constructor() {
    this.socket = io('http://localhost:8080');
    /*When I receive the message(from the "send message" function), I use the "getMessages" function from subject to get the message from myself and 
    send it to the server */
    this.socket?.on('chat message', (data: any) => {
      this.subject.next(data); // send the new message
    })

    this.socket?.on('tempUsername', (data:any)=>{
      this.subject.next(data);
    })
  }

  sendMessage(user: any) {
    this.socket?.emit('chat message', user);
  }

  updateUsername(user: any){
    this.socket?.emit('usernameUpdated', user);
  }
}
