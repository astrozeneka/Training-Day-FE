import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-subscriptions-verify-payment',
  templateUrl: './subscriptions-verify-payment.page.html',
  styleUrls: ['./subscriptions-verify-payment.page.scss'],
})
export class SubscriptionsVerifyPaymentPage implements OnInit {
  validated = true;
  amount = 100;

  constructor(
    private router:Router
  ) { }

  ngOnInit() {
  }

  clickVerify(){
    // TODO: implement
  }

  next(){
    this.router.navigate(['/subscriptions-verify-complete'])
  }

}
