import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, distinctUntilChanged, forkJoin, tap } from 'rxjs';
import { ChatV4Service } from 'src/app/chat-v4.service';
import { ContentService } from 'src/app/content.service';
import { User } from 'src/app/models/Interfaces';
import { isEqual } from 'lodash';
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
        // updating the offset
      })
  }

  public __loadMore() {
    this.cv4s.triggerLoadMore(this.user.id, this.correspondent.id, this.offset)
  }

  public clearCache(){
    this.cv4s.clearCache(this.user.id, this.correspondent.id)
  }
}
