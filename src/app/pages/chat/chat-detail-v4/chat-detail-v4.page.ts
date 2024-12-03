import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, distinctUntilChanged, forkJoin, tap } from 'rxjs';
import { ChatV4Service } from 'src/app/chat-v4.service';
import { ContentService } from 'src/app/content.service';
import { User } from 'src/app/models/Interfaces';
import { isEqual } from 'lodash';
import IMessage from 'src/app/models/IMessages';
const distinctUntilObjectChanged = distinctUntilChanged((a, b) => isEqual(a, b))

@Component({
  selector: 'app-chat-detail-v4',
  templateUrl: './chat-detail-v4.page.html',
  styleUrls: ['./chat-detail-v4.page.scss'],
})
export class ChatDetailV4Page implements OnInit {
  // The current user and correspondent user
  user: User|null = null;
  correspondent: User|null = null;
  // The message loading related data
  offset:Date = new Date()
  
  // Experimental (might be changed in the future)
  messageList: IMessage[] = []

  constructor(
    private cs: ContentService,
    private cv4s: ChatV4Service,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    // Fetch the route parameter id, It can be called multiple times in the component lifecycle, so we don't use Promise
    this.route.params.subscribe(params => {
      let userId = params['userId'];
      let correspondentId = params['correspondentId'];
      // Load user and correspondnet data
      let user$ = this.cv4s.onUserByIdData(userId, true, true)
      let correspondent$ = this.cv4s.onUserByIdData(correspondentId, true, true)
      combineLatest([user$, correspondent$])
        .pipe(distinctUntilChanged((a, b) => isEqual(a, b)))
        .subscribe(([user, correspondent])=>{
          this.user = user as User;
          this.correspondent = correspondent as User;
          this._initializeMessages(); 
        })
    });
  }

  private _initializeMessages() {
    this.cv4s.onMessages(this.user.id, this.correspondent.id, this.offset, true, true)
      .subscribe(messages=>{
        console.log(messages)
        this._updateMessageList(messages)
      })
  }

  private _updateMessageList(messages: IMessage[]) {
    messages.forEach(message => {
      let existing = this.messageList.findIndex(m => m.id == message.id)
      if (existing != -1) { // Update existing elements
        this.messageList[existing] = message
      } else { // Append new elements
        let index = this._findInsertIndex(message)
        this.messageList.splice(index, 0, message)
      }
    })
    // Update the date offset (the oldest loaded message)
    if (messages.length > 0) {
      this.offset = this.messageList[this.messageList.length - 1].created_at as Date
      console.log(this.offset)
    }
  }

  private _findInsertIndex(message: IMessage){
    // Optimized algorithm for sorted array
    let low = 0;
    let high = this.messageList.length;
    while (low < high) {
      let mid = Math.floor((low + high) / 2);
      if (this.messageList[mid].created_at > message.created_at) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  public __loadMore() {
    this.cv4s.triggerLoadMore(this.user.id, this.correspondent.id, this.offset, true, true)
  }

  public clearCache(){
    this.cv4s.clearCache(this.user.id, this.correspondent.id)
  }
}
