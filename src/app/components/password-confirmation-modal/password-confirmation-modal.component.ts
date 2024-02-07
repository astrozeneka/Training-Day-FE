import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-password-confirmation-modal',
  templateUrl: './password-confirmation-modal.component.html',
  styleUrls: ['./password-confirmation-modal.component.scss'],
})
export class PasswordConfirmationModalComponent  implements OnInit {
  form: FormGroup = new FormGroup({
    'password': new FormControl('', Validators.required),
  })
  displayedError = {
    'password': undefined
  }

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(this.form.value.password, 'confirm');
  }

}
