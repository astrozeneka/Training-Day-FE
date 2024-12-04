import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { catchError, debounceTime, merge, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { User, UserSettings } from 'src/app/models/Interfaces';

@Component({
  selector: 'app-coach-chat-settings',
  templateUrl: './coach-chat-settings.component.html',
  styleUrls: ['./coach-chat-settings.component.scss'],
})
export class CoachChatSettingsComponent  implements OnInit {

  @Input() user:User = null

  // 5. The activity status (copied from chat-master.page.ts)
  isOnline:boolean = undefined
  onlineToggleForm = new FormGroup({
    'available': new FormControl(undefined),
    'unavailable': new FormControl(undefined)
  }) // No validators

  constructor(
    private cs:ContentService
  ) { }

  ngOnInit() {
    // Handle the setting online form (exactly the same as in old chat-master)
    this.onlineToggleForm.valueChanges.subscribe((data)=>{
      let observables = []
      // For each key
      for (let key in data){
        if (data[key] === undefined || data[key] === null)
          continue
        let obj = {
          user_id: this.user.id,
          key: key,
          value: data[key]
        }
        observables.push(this.cs.put('/user-settings', obj)
          .pipe(catchError(error=>{
            return throwError(error)
          }))
        )
      }
      merge(...observables)
        .pipe(debounceTime(1000))
        .subscribe(async()=>{
          console.log("Vos paramètres ont été mises à jour") // NO need to show feedback message
          this.user.user_settings = {
            ...this.user.user_settings, 
            ...(data['available'] != null)?{available:data['available']}:{},
            ...(data['unavailable'] != null)?{unavailable:data['unavailable']}:{},
          }
          this.cs.userStorageObservable.updateStorage(this.user)
      })
    })
  }

  ngOnChanges(){
    this._computeIsOnline()
  }

  private _computeIsOnline(){
    // Make the previous settings display on the form
    for(let key in this.user.user_settings){
      if(this.onlineToggleForm.get(key)){
        this.onlineToggleForm.get(key).setValue(this.user.user_settings[key])
      }
    }

    // THe online status
    let userSettings = this.user.user_settings || {} as UserSettings
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
        console.log(this.isOnline)
    }
  }

}
