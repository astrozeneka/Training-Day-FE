import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ContentService} from "../../content.service";
import {AlertController, ModalController} from "@ionic/angular";
import {ActivatedRoute} from "@angular/router";
import {FeedbackService} from "../../feedback.service";
import {GoalViewComponent} from "../../components/entity-views/goal-view/goal-view.component";

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
})
export class GoalsPage implements OnInit {
  entityList:Array<any>|null = []
  pageCount:number = 0
  pageSegments:Array<any> = []
  pageOffset = 0;

  // No need
  //searchControl:FormControl = new FormControl("")

  constructor(
    private contentService:ContentService,
    private modalController: ModalController,
    private route:ActivatedRoute,
    private alertController:AlertController,
    private feedbackService:FeedbackService
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
    this.contentService.get('/goal-groups', this.pageOffset, "", "")
      .subscribe(([data, metaInfo]) => {
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
      component: GoalViewComponent,
      componentProps: {}
    })
    modal.present()
    const {data, role} = await modal.onWillDismiss();
    if (role == 'insert-success'){
      this.loadData()
    }
  }

  async showDeleteModal(id: number){
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
                this.feedbackService.registerNow("Vous avez supprimé un élémént")
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
      component: GoalViewComponent,
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

  onCheckboxChange(entity: any, event: any){
    entity.completed = event.detail.checked
    this.contentService.put('/goals', entity)
      .subscribe(async (res)=>{
        await this.feedbackService.registerNow("La progression a été mise à jour")
      })
  }

  onClickDelete(entity: any, event: any){
    let id = entity.id
    this.contentService.delete('/goals', `${id}`)
      .subscribe(async(res)=>{
        await this.feedbackService.registerNow("Un objectif a été supprimé")
        this.loadData()
      })
  }
}
