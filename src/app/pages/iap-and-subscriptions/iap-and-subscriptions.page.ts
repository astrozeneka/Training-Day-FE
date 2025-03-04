import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-iap-and-subscriptions',
  templateUrl: './iap-and-subscriptions.page.html',
  styleUrls: ['./iap-and-subscriptions.page.scss'],
})
export class IapAndSubscriptionsPage implements OnInit {

  form: FormGroup = new FormGroup({
    'realTime': new FormControl(true, []),
    'dateFrom': new FormControl(null, []),
    'dateTo': new FormControl(null, [])
  })

  constructor() { }

  ngOnInit() {
    // Initialization functions (form changes, etc.)


    // Load data from the backend
  }

}
