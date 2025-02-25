import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../custom-plugins/store.plugin';
import { ContentService } from '../content.service';
import { Router } from '@angular/router';
import { FeedbackService } from '../feedback.service';
import { PurchaseService } from '../purchase.service';
import { Platform } from '@ionic/angular';
import { User } from '../models/Interfaces';
import { EntitlementReady } from '../abstract-components/EntitlementReady';

@Component({
  selector: 'app-subscription-bubbles',
  templateUrl: './subscription-bubbles.component.html',
  styleUrls: ['./subscription-bubbles.component.scss'],
})
export class SubscriptionBubblesComponent {
  

}
