import { Component, OnInit } from '@angular/core';
import {Shop} from "../shop";

@Component({
  selector: 'app-food-program',
  templateUrl: './food-program.page.html',
  styleUrls: ['./food-program.page.scss'],
})
export class FoodProgramPage extends Shop implements OnInit{

  constructor() {
    super();
  }

  ngOnInit() {
  }
}
