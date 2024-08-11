import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-m-form',
  templateUrl: './m-form.component.html',
  styleUrls: ['./m-form.component.scss'],
})
export class MFormComponent  implements OnInit {

  @Input() formGroup: FormGroup|null;
  @Output() submit: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {}

}