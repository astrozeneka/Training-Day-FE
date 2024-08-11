import {NgModule} from "@angular/core";
import { MFormComponent } from "./dev/m-form/m-form.component";
import {ReactiveFormsModule} from "@angular/forms";
import {IonicModule} from "@ionic/angular";

@NgModule({
  declarations: [
    MFormComponent
  ],
  imports: [
    ReactiveFormsModule,
    IonicModule
  ],
  exports: [
    MFormComponent
  ]
})
export class DevComponentsModule { }