import { Component, OnInit } from '@angular/core';
import {AlertController, ModalController} from "@ionic/angular";
import {DayoffViewComponent} from "../../../components/entity-views/dayoff-view/dayoff-view.component";
import {FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";

@Component({
  selector: 'app-manage-dayoff-view',
  templateUrl: './manage-dayoff-view.page.html',
  styleUrls: ['./manage-dayoff-view.page.scss'],
})
export class ManageDayoffViewPage implements OnInit {
  entityList:Array<any> = []
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

  loadData(){
    console.log("Refresh")
    this.contentService.get('/dayoff', this.pageOffset, this.searchControl.value, "f_content")
      .subscribe(([data, metaInfo]) => {
        this.entityList = data as unknown as Array<any>
        this.pageCount = Math.ceil((metaInfo as any).count / 10) as number
        this.pageSegments = Array.from({length: this.pageCount} as any, (_, index)=> ({
          label: (index+1).toString(),
          value: index
        }))
        console.log(data)
      })

  }

  async showAddModal(){
    let modal = await this.modalController.create({
      component: DayoffViewComponent,
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
            this.contentService.delete('/dayoff', `${id}`)
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
      component: DayoffViewComponent,
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
