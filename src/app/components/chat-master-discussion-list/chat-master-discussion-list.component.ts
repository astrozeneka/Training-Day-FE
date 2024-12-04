import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { distinctUntilChanged, tap } from 'rxjs';
import { BroadcastingService } from 'src/app/broadcasting.service';
import { ChatV4Service } from 'src/app/chat-v4.service';
import { ContentService } from 'src/app/content.service';
import { User, UserSettings } from 'src/app/models/Interfaces';

@Component({
  selector: 'app-chat-master-discussion-list',
  templateUrl: './chat-master-discussion-list.component.html',
  styleUrls: ['./chat-master-discussion-list.component.scss'],
})
export class ChatMasterDiscussionListComponent  implements OnInit, OnChanges {

  @Input() userId: number
  user: User = null
  @Output() onUser = new EventEmitter<User>() // (experimental)
  isOnline:boolean = false

  constructor(
    private cv4s: ChatV4Service,
    private bs: BroadcastingService,
    private cs: ContentService
  ) { }

  ngOnInit() {
    let userLoaded$ = this.cv4s.onUserByIdData(this.userId, true, true)
      .pipe(tap((user)=>{
        this.user = user
        this.onUser.emit(user)

        // ====
        // If you want to apply this to the normal user, handle it from here
        // ====
    }))

    userLoaded$.pipe(distinctUntilChanged((a, b)=>a.id === b.id))
      .subscribe((event)=>{

        // Pusher listener
        console.log("Subscribe")
        this.bs.pusher.subscribe(this._channelId()).bind(this._eventId(), (data)=>{
          console.log(data)
        })
        this.cs.post(`/chat/request-update/${this.user.id}`, {})
          .subscribe(data => null)
          
      })

  }

  private _computeOnlineStatus(){
    // Same code as in chat-master.page.ts
    let userSettings:UserSettings = this.user.user_settings || {} as any
    if(userSettings.activeFrom && userSettings.activeTo && userSettings.pauseDays){
        let activeFrom = userSettings.activeFrom // e.g. 08:00
        let activeTo = userSettings.activeTo // e.g. 18:00
        let pauseDays = userSettings.pauseDays // e.g. [0, 6] for Sunday and Saturday
        let now = new Date()

        // Check if the user is active
        let isPauseDay = pauseDays.includes(now.getDay())
        let [activeFromHour, activeFromMinute] = activeFrom.split(':').map(Number);
        let [activeToHour, activeToMinute] = activeTo.split(':').map(Number);
        let isInActiveTime = (now.getHours() > activeFromHour || (now.getHours() === activeFromHour && now.getMinutes() >= activeFromMinute)) &&
                             (now.getHours() < activeToHour || (now.getHours() === activeToHour && now.getMinutes() < activeToMinute));
        
        this.isOnline = !isPauseDay && isInActiveTime
    }
  }

  ngOnChanges() {}

  private _channelId(){
    return `messages.${this.user?.id ?? this.userId}`
  }

  private _eventId(){
    return 'master-updated'
  }

}
