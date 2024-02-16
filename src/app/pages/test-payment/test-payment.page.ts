import { Component, OnInit } from '@angular/core';
import {loadStripe} from '@stripe/stripe-js';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-test-payment',
  templateUrl: './test-payment.page.html',
  styleUrls: ['./test-payment.page.scss'],
})
export class TestPaymentPage implements OnInit {

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    // คิดค่อ server
    this.http.post('http://localhost:8000/api/test-payment?XDEBUG_SESSION_START=1', {})
      .subscribe((res)=>{
      })
  }

}
