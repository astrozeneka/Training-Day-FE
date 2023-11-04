import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";
import {ActivatedRoute} from "@angular/router";
import {FormControl, FormGroup} from "@angular/forms";
import {refresh} from "ionicons/icons";
import {ModalController} from "@ionic/angular";
import {DeleteModalComponent} from "../../../components/delete-modal/delete-modal.component";
import {FeedbackService} from "../../../feedback.service";

@Component({
  selector: 'app-manage-files-view',
  templateUrl: './manage-files-view.page.html',
  styleUrls: ['./manage-files-view.page.scss'],
})
export class ManageFilesViewPage implements OnInit {

  entityList:Array<any> = []
  pageCount:number = 0
  pageSegments:Array<any> = []
  pageOffset = 0;

  searchControl:FormControl = new FormControl("")
  formGroup = new FormGroup({})

  constructor(
    private contentService:ContentService,
    private route:ActivatedRoute,
    private modalController:ModalController,
    private feedbackService:FeedbackService
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
    this.contentService.get(`/files`, this.pageOffset, this.searchControl.value, "f_name").subscribe(([data, metaInfo])=>{
      this.entityList = data as unknown as Array<any>
      // The page segments
      this.pageCount = Math.ceil((metaInfo as any).count / 10) as number
      this.pageSegments = Array.from({length: this.pageCount} as any, (_, index)=> ({
        label: (index+1).toString(),
        value: index
      }))
      // The checkbox
      this.formGroup = new FormGroup({})
      this.entityList.forEach((entity)=>{
        this.formGroup.addControl(`${entity.id}`, new FormControl(false))
      })
    })
  }

  updatePage(page:number){
    this.pageOffset = page*10
    this.loadData()
  }

  async deleteBatch(){
    let toDeleteList = []
    for (const key in this.formGroup.value)
      if ((this.formGroup.value as any)[key] === true)
        toDeleteList.push(key);
    // เปิด modal
    let modal = await this.modalController.create({
      component: DeleteModalComponent,
      componentProps: {
        // Custom properties
      }
    })
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.contentService.delete('/files', toDeleteList.join(','))
        .subscribe((res:any)=>{
          this.loadData()
          this.feedbackService.registerNow("La suppression a été effectuée")
        })
    }
  }

  getCheckboxControl(entity:any):FormControl {
    return (this.formGroup.controls as any)[entity.id]
  }
}
