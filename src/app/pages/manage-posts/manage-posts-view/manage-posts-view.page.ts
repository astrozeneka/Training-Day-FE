import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ContentService} from "../../../content.service";
import {AlertController, ModalController} from "@ionic/angular";
import {ActivatedRoute} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";
import {PostViewComponent} from "../../../components/entity-views/post-view/post-view.component";

@Component({
  selector: 'app-manage-posts-view',
  templateUrl: './manage-posts-view.page.html',
  styleUrls: ['./manage-posts-view.page.scss'],
})
export class ManagePostsViewPage implements OnInit {
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
    this.contentService.get('/posts', this.pageOffset, this.searchControl.value, "f_title")
      .subscribe(([data, metaInfo]) => {
        this.entityList = data as unknown as Array<any>
        this.pageCount = Math.ceil((metaInfo as any).count / 10) as number
        this.pageSegments = Array.from({length: this.pageCount} as any, (_, index)=> ({
          label: (index+1).toString(),
          value: index
        }))
      })
  }

  async showAddModal(){
    let modal = await this.modalController.create({
      component: PostViewComponent,
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
            this.contentService.delete('/posts', `${id}`)
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

  async showDetailsModal(entity:any) {
    let modal = await this.modalController.create({
      component: PostViewComponent,
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
}
