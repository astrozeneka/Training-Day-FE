import { Component } from '@angular/core';

@Component({
  selector: 'app-purchase-invoice-shimmer',
  template: `
    <div class="shimmer-card">
      <div class="shimmer-badge"></div>
      <div class="shimmer-content">
        <div class="shimmer-duration"></div>
        <div class="shimmer-price"></div>
        <div class="shimmer-details"></div>
      </div>
      <div class="shimmer-check"></div>
    </div>
  `,
  styles: [`
    .shimmer-card {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border: 2px solid var(--ion-color-light);
      border-radius: 16px;
      background: var(--ion-background-color);
      margin-bottom: 12px;
    }

    .shimmer-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 40px;
      height: 20px;
      border-radius: 12px;
      background: var(--ion-color-step-200, #e0e0e0);
      overflow: hidden;
      position: relative;
    }

    .shimmer-content {
      flex: 1;
    }

    .shimmer-duration {
      height: 18px;
      width: 50%;
      border-radius: 4px;
      background: var(--ion-color-step-200, #e0e0e0);
      margin-bottom: 8px;
      overflow: hidden;
      position: relative;
    }

    .shimmer-price {
      height: 24px;
      width: 40%;
      border-radius: 4px;
      background: var(--ion-color-step-200, #e0e0e0);
      margin-bottom: 6px;
      overflow: hidden;
      position: relative;
    }

    .shimmer-details {
      height: 13px;
      width: 70%;
      border-radius: 4px;
      background: var(--ion-color-step-200, #e0e0e0);
      overflow: hidden;
      position: relative;
    }

    .shimmer-check {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--ion-color-step-200, #e0e0e0);
      flex-shrink: 0;
      margin-left: 12px;
      overflow: hidden;
      position: relative;
    }

    .shimmer-badge::after,
    .shimmer-duration::after,
    .shimmer-price::after,
    .shimmer-details::after,
    .shimmer-check::after {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 200%;
      height: 100%;
      background: linear-gradient(90deg,
        rgba(var(--ion-background-color-rgb), 0) 0%,
        rgba(var(--ion-background-color-rgb), 0.4) 50%,
        rgba(var(--ion-background-color-rgb), 0) 100%);
      animation: shimmerAnimation 1.5s infinite;
    }

    @keyframes shimmerAnimation {
      to {
        transform: translateX(100%);
      }
    }
  `]
})
export class PurchaseInvoiceShimmerComponent {}
