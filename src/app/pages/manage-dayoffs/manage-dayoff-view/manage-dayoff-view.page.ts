import { Component, OnInit } from '@angular/core';
import {ModalController} from "@ionic/angular";
import {DayoffViewComponent} from "../../../components/entity-views/dayoff-view/dayoff-view.component";

@Component({
  selector: 'app-manage-dayoff-view',
  templateUrl: './manage-dayoff-view.page.html',
  styleUrls: ['./manage-dayoff-view.page.scss'],
})
export class ManageDayoffViewPage implements OnInit {

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  async showAddModal(){
    let modal = await this.modalController.create({
      component: DayoffViewComponent,
      componentProps: {}
    })
    modal.present()
    const {data, role} = await modal.onWillDismiss();
    if (role == 'insert-success'){

    }else if(role == 'update-success'){
      // คิด่วาต้องเรียก
    }
  }

  showDeleteModal(){

  }

  async showDetailsModal(){
  }

}
