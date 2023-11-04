import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-file-view',
  templateUrl: './file-view.component.html',
  styleUrls: ['./file-view.component.scss'],
})
export class FileViewComponent  implements OnInit {
  @Input() entity:any = "";

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    console.log(this.entity)
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  update(){
    // NO exist
  }

}
