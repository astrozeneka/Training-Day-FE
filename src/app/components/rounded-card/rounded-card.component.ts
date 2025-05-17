import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rounded-card',
  template: `<div class="rounded-card">
  <div class="header">
    <div class="img-container">
      <ng-content select="*[slot='image']"></ng-content>
    </div>
  </div>
  <div class="content">
    <div class="title">
      <ng-content select="*[slot='title']"></ng-content>
    </div>
    <div class="description">
      <ng-content select="*[slot='description']"></ng-content>
    </div>
  </div>
  <div class="actions">
    <ion-button
      [color]="color"
      expand="block"
      shape="round"
      (click)="triggerAction()"
    >
      {{ actionText}}
    </ion-button>
  </div>
</div>`,
  styles: [`
  .rounded-card{
    border: 1px solid var(--ion-color-lightgrey);
    border-radius: 20px;
    padding: 17px;
    margin-top: 10px;
    margin-bottom: 10px;
    max-width: 500px;

    & .header{
        & .img-container{
            height:70px;
            border-radius: 10px;
            overflow: hidden;

            // Center the image
            display: flex;
            justify-content: center;
            align-items: center;

            & img{
                width: 100%;
                height: 100%;
                object-fit: cover;
                min-width: 100%!important;
            }
        }
    }
    & .content{
        padding-left: 5px;
        padding-right: 5px;
        & .title{
            font-size: 20px;
            font-weight: 500;
            margin-top: 22px;
        }
        & .description{
            font-size: 15px;
            margin-top: 17px;
        }
    }
    & .actions{
        margin-top: 35px;
        & ion-button{
            text-transform: none!important;
        }
    }
}
    `]
})
export class RoundedCardComponent implements OnInit {
  @Input() color: string = "primary"
  @Input() actionText: string = "Voir Plus"

  // routerLink and query params
  @Input() routerLink!: string[] | any[];
  @Input() queryParams?: Record<string, any>;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() { }

  triggerAction() {
    if (this.routerLink) {
      this.router.navigate(this.routerLink, { queryParams: this.queryParams });
    }
  }

}
