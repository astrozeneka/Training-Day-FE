import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-personal-trainer',
  templateUrl: './personal-trainer.page.html',
  styleUrls: ['./personal-trainer.page.scss'],
})
export class PersonalTrainerPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  clickCoachingOption(coachingNumber:number, price:number){
    console.log("clickCoachingOption", coachingNumber, price);
  }

}
