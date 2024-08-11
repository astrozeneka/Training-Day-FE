import {NgModule} from "@angular/core";
import { MFormComponent } from "./prod/m-form/m-form.component";
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    MFormComponent
  ],
  imports: [
    ReactiveFormsModule
  ],
  exports: [
    MFormComponent
  ]
})
export class ProdComponentsModule { }