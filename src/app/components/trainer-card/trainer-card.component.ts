import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-trainer-card',
  templateUrl: './trainer-card.component.html',
  styleUrls: ['./trainer-card.component.scss'],
})
export class TrainerCardComponent  implements OnInit {
  @Input() entity:any = undefined;
  @Input() coachMode:boolean = false;
  @Input() columns:boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
