import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {ActionSheetController} from "@ionic/angular";

@Component({
  selector: 'app-m-form',
  templateUrl: './m-form.component.html',
  styleUrls: ['./m-form.component.scss'],
})
export class MFormComponent  implements OnInit {

  @Input() formGroup: FormGroup|null;
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {

  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Actions',
      buttons: [
        {
          text: 'ryanrasoarahona@gmail.com',
          data: {
            action: 'email',
            email: 'ryanrasoarahona@gmail.com',
            password: 'ryanrasoarahona2'
          },
        },
        {
          text: 'rose.pink@localhost.com',
          data: {
            action: 'email',
            email: 'rose.pink@localhost.com',
            password: 'rosepink1'
          }
        },
        {
          text: 'bleu.blue@localhost.com',
          data: {
            action: 'email',
            email: 'bleu.blue@localhost.com',
            password: 'bleublue1@'
          }
        },
        {
          text: 'coach@localhost.com',
          data: {
            action: 'email',
            email: 'coach@localhost.com',
            password: 'coachcoach1'
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });
    await actionSheet.present();
    const { data } = await actionSheet.onDidDismiss();
    if (data.action == 'email') {
      this.formGroup.patchValue({
        'email': data.email,
        'password': data.password
      })
    }
  }

}
