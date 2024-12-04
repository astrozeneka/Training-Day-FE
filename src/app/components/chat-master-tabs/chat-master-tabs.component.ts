import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { coachTabOption } from 'src/app/coach-chat-master.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-chat-master-tabs',
  templateUrl: './chat-master-tabs.component.html',
  styleUrls: ['./chat-master-tabs.component.scss'],
})
export class ChatMasterTabsComponent  implements OnInit {

  @Input() selectedTab:coachTabOption = 'coach';
  @Output() swipeToTab = new EventEmitter<coachTabOption>();

  constructor() { }

  ngOnInit() {}

  ngOnChanges() {}

}
