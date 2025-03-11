import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-s6-activity',
  templateUrl: './s6-activity.page.html',
  styleUrls: ['./s6-activity.page.scss'],
})
export class S6ActivityPage implements OnInit {

  form:FormGroup = new FormGroup({
    activity: new FormControl('', [Validators.required])
  })
  displayedError = {
    activity: undefined
  }

  activityKeyAccessor = (option: any) => option.text
  activityOptions = [
    {"slug": "sedentary", "text": "Sédentaire"},
    {"slug": "light", "text": "Légèrement actif"},
    {"slug": "moderate", "text": "Modérément actif"},
    {"slug": "intense", "text": "Très actif"},
    {"slug": "extreme", "text": "Athlète (+2h de sport intensif par jour)"}
  ]


  constructor() { }

  ngOnInit() {
  }

}
