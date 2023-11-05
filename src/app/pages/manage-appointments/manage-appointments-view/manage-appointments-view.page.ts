import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {AlertController, ModalController} from "@ionic/angular";
import {ActivatedRoute} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";
import {AppointmentViewComponent} from "../../../components/entity-views/appointment-view/appointment-view.component";
import {DayoffViewComponent} from "../../../components/entity-views/dayoff-view/dayoff-view.component";

@Component({
  selector: 'app-manage-appointments-view',
  templateUrl: './manage-appointments-view.page.html',
  styleUrls: ['./manage-appointments-view.page.scss'],
})
export class ManageAppointmentsViewPage implements OnInit {
  entityList:Array<any>|null = []
  pageCount:number = 0
  pageSegments:Array<any> = []
  pageOffset = 0;

  searchControl:FormControl = new FormControl("")

  constructor(
    private contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feeedbackService:FeedbackService
  ) {
    this.route.params.subscribe(()=>{
      this.loadData()
    })
  }

  ngOnInit() {
    this.loadData()
  }

  updatePage(page:number){
    this.pageOffset = page*10
    this.loadData()
  }

  loadData() {
    this.entityList = null
    this.contentService.get('/appointments', this.pageOffset, this.searchControl.value, "f_description")
      .subscribe(([data, metaInfo])=>{
        this.entityList = data as unknown as Array<any>
        this.pageCount = Math.ceil((metaInfo as any).count / 10) as number
        this.pageSegments = Array.from({length: this.pageCount} as any, (_, index)=> ({
          label: (index+1).toString(),
          value: index
        }))

        console.log(this.entityList)
      })
  }

  async showAddModal(){
    let modal = await this.modalController.create({
      component: AppointmentViewComponent,
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
          handler: ()=>{ }
        },
        {
          text: 'Supprimer',
          cssClass: 'ion-color-danger',
          handler: ()=>{
            this.contentService.delete('/appointments', `${id}`)
              .subscribe(()=>{
                this.feeedbackService.registerNow("Vous avez supprimé un élémént")
                this.loadData()
              })
          }
        }
      ]
    })
    await alert.present();
  }

  async showDetailsModal(entity: any){
    let modal = await this.modalController.create({
      component: AppointmentViewComponent,
      componentProps: {
        entity: entity
      }
    })
    modal.present()
    const {data, role} = await modal.onWillDismiss();
    if(role == 'update-success'){
      // คิด่วาต้องเรียก
      this.loadData()
    }
  }

}
