import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rounded-card',
  templateUrl: './rounded-card.component.html',
  styleUrls: ['./rounded-card.component.scss'],
})
export class RoundedCardComponent  implements OnInit {
  @Input() color:string = "primary"
  @Input() actionText:string = "Voir Plus"
  @Input() routerLink:string|undefined = undefined

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {}

  triggerAction(){
    if (this.routerLink){
      this.router.navigate([this.routerLink])
    }
  }

}
