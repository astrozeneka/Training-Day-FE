import { Component, OnInit } from '@angular/core';
import {ContentService} from "../content.service";


export class AbstractComponent {

  constructor(
    public contentService: ContentService
  ) {
  }

  getStaticUrl(suffix:any){
    return this.contentService.rootEndpoint + '/' + suffix
  }

}
