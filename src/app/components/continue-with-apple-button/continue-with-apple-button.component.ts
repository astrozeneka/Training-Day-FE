import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-continue-with-apple-button',
  templateUrl: './continue-with-apple-button.component.html',
  styleUrls: ['./continue-with-apple-button.component.scss'],
})
export class ContinueWithAppleButtonComponent  implements OnInit {
  @Output() action = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {}

  trigger(){
    console.log("Continue with Apple triggered")
    this.action.emit("Hello world");
  }

}
