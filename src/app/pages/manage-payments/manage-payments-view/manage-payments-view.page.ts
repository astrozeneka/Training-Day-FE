import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {AlertController, ModalController, PopoverController} from "@ionic/angular";
import {ActivatedRoute} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";
import {PaymentViewComponent} from "../../../components/entity-views/payment-view/payment-view.component";
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage-payments-view',
  templateUrl: './manage-payments-view.page.html',
  styleUrls: ['./manage-payments-view.page.scss'],
})
export class ManagePaymentsViewPage implements OnInit {
  entityList:Array<any>|null = []
  pageCount:number = 0
  pageSegments:Array<any> = []
  pageOffset = 0;
  jwtToken: string = undefined

  filter = {} // Not used anymore

  // Using state management rx
  filterSubject = new BehaviorSubject<any>({})
  filter$ = this.filterSubject.asObservable();

  // The selected item
  slug = undefined
  month_year = undefined

  // The dates to filter
  dates = []

  // Product names
  productName = {
    'hoylt': 'Pack Hoylt',
    'moreno': 'Pack Moreno',
    'alonzo': 'Pack Alonzo',
    'foodcoach_1w': 'Programme Alimentaire Hebdomadaire',
    'foodcoach_4w': 'Programme Alimentaire Mensuel',
    'foodcoach_6w': 'Programme Alimentaire 6 Semaines',
    'sportcoach_1w': 'Programme Sportif Hebdomadaire',
    'sportcoach_4w': 'Programme Sportif Mensuel',
    'sportcoach_6w': 'Programme Sportif 6 Semaines',
    'trainer1': '1 Séance de Coaching',
    'trainer5': '5 Séances de Coaching',
    'trainer10': '10 Séances de Coaching'
  }


  searchControl:FormControl = new FormControl("")
  constructor(
    public contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feedbackService:FeedbackService,
    private popoverController: PopoverController
  ) {
    this.route.params.subscribe(()=>{
      this.loadData()
    })
  }

  async ngOnInit() {
    this.jwtToken = await this.contentService.storage.get('token')
    this.loadData()
  }

  updatePage(page:number){
    this.pageOffset = page*10
    this.loadData()
  }

  loadData() {
    this.entityList = null
    this.contentService.get('/payments', this.pageOffset, this.searchControl.value, "f_description")
      .subscribe(([data, metaInfo])=> {
        this.entityList = data as unknown as Array<any>
        this.pageCount = Math.ceil((metaInfo as any).count / 10) as number
        this.pageSegments = Array.from({length: this.pageCount} as any, (_, index)=> ({
          label: (index+1).toString(),
          value: index
        }))
      })
  }

  async showAddModal() {
    let modal = await this.modalController.create({
      component: PaymentViewComponent,
      componentProps: {}
    })
    modal.present()
    const {data, role} = await modal.onWillDismiss();
    if (role == 'insert-success'){
      this.loadData()
    }
  }

  async showDeleteModal(id:number){
    let alert = await this.alertController.create({
      header: "Supprimer l'élément",
      message: "Veuillez confirmer la suppression",
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        },
        {
          text: 'Supprimer',
          cssClass: 'ion-color-danger',
          handler: () => {
            this.contentService.delete('/payments', `${id}`)
              .subscribe(() => {
                this.feedbackService.registerNow("Vous avez supprimé un élémént")
                this.loadData()
              })
          }
        }
      ]
    })
    await alert.present();
  }

  async showDetailsModal(entity: any) {
    let modal = await this.modalController.create({
      component: PaymentViewComponent,
      componentProps: {
        entity: entity
      }
    })
    modal.present()
    const {data, role} = await modal.onWillDismiss();
    if (role == 'update-success') {
      // คิด่วาต้องเรียก
      this.loadData()
    }
  }

  filterBy(slug:any){
    this.slug = slug
    this.filterSubject.next({
      'f_slug': this.slug ?? '',
      'f_month_year': this.month_year ?? ''
    })
    this.popoverController.dismiss()
  }

  dateOf(month_year:string){
    this.month_year = month_year
    this.filterSubject.next({
      'f_slug': this.slug ?? '',
      'f_month_year': this.month_year ?? ''
    })
    this.popoverController.dismiss()
  }

  onAfterLoad({data, metainfo}){
    /*
    2024-10"
      1
      : 
      "2024-08"
      2
      : 
      "2024-07"
      3
      : 
      "2024-04"
      4
      : 
      "2024-03"
      5
      : 
      "2021-07
      */
    let months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre"
    ]
    let dates = metainfo.dates
    // Convert dates to french
    this.dates = dates.map((date:string)=>{
      let [year, month] = date.split("-")
      return [`${months[parseInt(month)-1]} ${year}`, date]
    })
  }
}
