import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-subscription-card',
  templateUrl: './subscription-card.component.html',
  styleUrls: ['./subscription-card.component.scss'],
})
export class SubscriptionCardComponent implements OnInit {
  @Input() entity:any = undefined;
  @Input() coachMode:boolean = false;
  @Input() columns:boolean = true;

  @Input() title: String = "Titel";
  @Input() description: String = "Description";
  @Input() expiresAt: String;

  _expiresAt: Date;

  constructor() {

  }

  ngOnInit() {
    this._expiresAt = new Date(this.expiresAt as any);
  }

  protected readonly Date = Date;
}
