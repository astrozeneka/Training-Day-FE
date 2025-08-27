import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscription-cta-compact',
  template: `
    <div class="subscription-cta-compact ion-padding-horizontal">
      <div class="subscription-cta-card">
        <div class="subscription-cta-content">
          <!-- Premium Badge -->
          <div class="premium-badge">
            <ion-icon name="diamond" class="premium-badge-icon"></ion-icon>
            <span class="premium-badge-text">{{ badgeText }}</span>
          </div>
          
          <!-- Content -->
          <div class="cta-header">
            <h3 class="cta-title">{{ title }}</h3>
            <p class="cta-subtitle">{{ subtitle }}</p>
          </div>
          
          <!-- CTA Button -->
          <ion-button 
            class="premium-cta-button-compact" 
            expand="block" 
            shape="round"
            (click)="onButtonClick()">
            <ion-icon [name]="buttonStartIcon" slot="start" *ngIf="buttonStartIcon"></ion-icon>
            {{ buttonText }}
            <ion-icon [name]="buttonEndIcon" slot="end" *ngIf="buttonEndIcon"></ion-icon>
          </ion-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subscription-cta-compact {
      margin-bottom: 1.5rem;
    }
    
    .subscription-cta-card {
      background: var(--ion-color-light);
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      border: 2px solid transparent;
      background-clip: padding-box;
      padding: 8px;
    }
    
    .subscription-cta-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 20px;
      padding: 2px;
      background: var(--ion-color-primary, #3880ff);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      -webkit-mask-composite: xor;
      z-index: 1;
    }
    
    .subscription-cta-content {
      position: relative;
      z-index: 2;
      padding: 1.5rem;
      background: var(--ion-color-light);
      border-radius: 18px;
      text-align: center;
    }
    
    .premium-badge {
      display: inline-flex;
      align-items: center;
      background: var(--ion-color-primary);
      color: white;
      padding: 0.4rem 0.8rem;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 1rem;
      box-shadow: 0 4px 12px rgba(56, 128, 255, 0.3);
    }
    
    .premium-badge-icon {
      font-size: 0.9rem;
      margin-right: 0.3rem;
    }
    
    .premium-badge-text {
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .cta-header {
      margin-bottom: 1.5rem;
    }
    
    .cta-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--ion-color-dark, #000000);
      line-height: 1.2;
    }
    
    .cta-subtitle {
      margin: 0;
      font-size: 0.9rem;
      color: var(--ion-color-medium, #666666);
      line-height: 1.3;
    }
    
    .premium-cta-button-compact {
      --background: var(--ion-color-primary, #3880ff);
      --color: white;
      --padding-top: 0.8rem;
      --padding-bottom: 0.8rem;
      --padding-start: 1.2rem;
      --padding-end: 1.2rem;
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      text-transform: none;
      letter-spacing: 0.2px;
    }
    
    .premium-cta-button-compact ion-icon {
      font-size: 1.1rem;
    }
    
    .premium-cta-button-compact ion-icon[slot="start"] {
      margin-right: 0.4rem;
    }
    
    .premium-cta-button-compact ion-icon[slot="end"] {
      margin-left: 0.4rem;
    }
    
    .premium-cta-button-compact:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
    
    @media screen and (max-width: 480px) {
      .subscription-cta-compact {
        margin-bottom: 1rem;
      }
      
      .subscription-cta-content {
        padding: 1.2rem;
      }
      
      .cta-header {
        margin-bottom: 1.2rem;
      }
      
      .cta-title {
        font-size: 1.1rem;
      }
      
      .cta-subtitle {
        font-size: 0.85rem;
      }
      
      .premium-cta-button-compact {
        --padding-top: 0.7rem;
        --padding-bottom: 0.7rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class SubscriptionCtaCompactComponent implements OnInit {
  @Input() badgeText: string = 'Premium';
  @Input() title: string = 'Débloquez tous les avantages';
  @Input() subtitle: string = 'Programmes personnalisés et coach dédié';
  @Input() buttonText: string = 'Accéder à la boutique';
  @Input() buttonStartIcon: string = 'storefront';
  @Input() buttonEndIcon: string = 'arrow-forward';
  
  @Output() buttonClick = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {}

  onButtonClick() {
    this.buttonClick.emit();
  }
}
