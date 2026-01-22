import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-food-program-master',
  templateUrl: './food-program-master.page.html',
  styleUrls: ['./food-program-master.page.scss'],
})
export class FoodProgramMasterPage implements OnInit {

  programs = [
    {
      range: '100 – 1 300 kcal',
      description: 'Programme très léger'
    },
    {
      range: '1 300 – 1 600 kcal',
      description: 'Programme léger'
    },
    {
      range: '1 600 – 2 000 kcal',
      description: 'Programme modéré'
    },
    {
      range: '2 000 – 2 400 kcal',
      description: 'Programme standard'
    },
    {
      range: '2 400 – 3 000 kcal',
      description: 'Programme intensif'
    }
  ]

  constructor() { }

  ngOnInit() {
  }

}
