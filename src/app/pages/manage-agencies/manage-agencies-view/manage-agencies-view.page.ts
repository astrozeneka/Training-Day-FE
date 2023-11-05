import { Component, OnInit } from '@angular/core';
import {ModalController} from "@ionic/angular";
import {AgencyViewComponent} from "../../../components/entity-views/agency-view/agency-view.component";

@Component({
  selector: 'app-manage-agencies-view',
  templateUrl: './manage-agencies-view.page.html',
  styleUrls: ['./manage-agencies-view.page.scss'],
})
export class ManageAgenciesViewPage implements OnInit {

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  async showAddModal() {
    let modal = await this.modalController.create({
      component: AgencyViewComponent,
      componentProps: {}
    })
    modal.present()
    const { data, role } = await modal.onWillDismiss();
    if (role == 'insert-success'){
      // Add the data by using the post
    }else if(role == 'update-success'){
      // In case of update
    }
  }

  async showDetailsModal() {
    // TODO, show the details modal
  }

  async showDeleteModal(){
    // TODO, show the delete modal
  }
}
