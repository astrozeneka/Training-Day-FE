import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-button-to-chat',
  templateUrl: './button-to-chat.component.html',
  styleUrls: ['./button-to-chat.component.scss'],
})
export class ButtonToChatComponent  implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {}

  action() {
    this.router.navigate(['messenger-master']);
  }
 
}
