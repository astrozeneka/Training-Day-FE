import { Component, OnInit } from '@angular/core';
import {Shop} from "../shop";

@Component({
  selector: 'app-sport-program',
  templateUrl: './sport-program.page.html',
  styleUrls: ['./sport-program.page.scss'],
})
export class SportProgramPage extends Shop implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
