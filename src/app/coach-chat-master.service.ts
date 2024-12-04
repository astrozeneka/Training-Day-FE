import { Injectable } from '@angular/core';
import StoredData from './components-submodules/stored-data/StoredData';
import { BehaviorSubject, Subject } from 'rxjs';
import { BroadcastingService } from './broadcasting.service';
import { ContentService } from './content.service';

export type coachTabOption = 'coach'|'nutritionist'

@Injectable({
  providedIn: 'root'
})
export class CoachChatMasterService {

  activeTabData: StoredData<coachTabOption>
  // activeTabSubject = new BehaviorSubject<coachTabOption>('coach')
  // activeTab$ = this.activeTabSubject.asObservable()

  constructor(
    private cs: ContentService,
    private bs: BroadcastingService
  ) { 
    this.activeTabData = new StoredData<coachTabOption>('activeTab', this.cs.storage)
  }

  onActiveTab(){
    let output$ = new Subject<coachTabOption>()
    this.activeTabData.get().then((data:coachTabOption)=>{
      output$.next(data)
    })
    return output$
  }
}
