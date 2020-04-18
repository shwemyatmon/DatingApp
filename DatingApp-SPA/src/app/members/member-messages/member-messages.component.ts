import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { Message } from 'src/app/_models/message';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() recipientId: number;
  messages: Message[];
  newMessage: any = {};

  constructor(private authService: AuthService,
              private userService: UserService,
              private alertifyService: AlertifyService) { }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    console.log('reach here');
    const currentUserId = +this.authService.decodedToken.nameid;
    this.userService.getMessageThread(this.authService.decodedToken.nameid, this.recipientId)
    .pipe(
      tap(messages => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < messages.length; i++ ) {
             if (messages[i].isRead === false && messages[i].recipientId === currentUserId) {
               this.userService.markAsRead(messages[i].id, currentUserId);
             }
        }
      })
    )
    .subscribe(messages => {
      this.messages = messages;
    }, error => {
      this.alertifyService.error(error);
    });
  }

   sendMessage() {
     this.newMessage.recipientId = this.recipientId;
     this.userService.sendMessage(this.authService.decodedToken.nameid, this.newMessage)
     .subscribe((message: Message) => {
       this.messages.unshift(message);
       this.newMessage = '';
     }, error => {
       this.alertifyService.error(error);
     });
   }


}
