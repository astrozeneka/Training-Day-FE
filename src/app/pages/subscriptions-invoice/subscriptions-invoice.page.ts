import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-subscriptions-invoice',
  templateUrl: './subscriptions-invoice.page.html',
  styleUrls: ['./subscriptions-invoice.page.scss'],
})
export class SubscriptionsInvoicePage implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  goToPayment(){
    this.router.navigate(['subscriptions-verify-payment'])
  }
}
