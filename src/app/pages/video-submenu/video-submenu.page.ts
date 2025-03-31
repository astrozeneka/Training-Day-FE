import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { distinct, distinctUntilChanged, distinctUntilKeyChanged } from 'rxjs';
import { VideoService } from 'src/app/video.service';

@Component({
  selector: 'app-video-submenu',
  templateUrl: './video-submenu.page.html',
  styleUrls: ['./video-submenu.page.scss'],
})
export class VideoSubmenuPage implements OnInit {

  group: string = undefined

  menuItems: string[] = []

  icons: any = {
    'training/corps-entier': "../../../assets/icon/training-corps-entier-transparent.png",
    'training/bras': "../../../assets/icon/training-bras-epaules-transparent.png",
    'training/abdos': "../../../assets/icon/training-abdos-transparent.png",
    'training/jambes': "../../../assets/icon/training-jambes-transparent.png",
    'training/fessiers': "../../../assets/icon/training-fessiers-transparent.png",
    'training/pectoraux': "../../../assets/icon/training-pectoraux-transparent.png",
    'training/dos': "../../../assets/icon/training-dos-transparent.png",
    'boxing/base': "../../../assets/icon/boxing-base-orange.png",
    'boxing/poings': "../../../assets/icon/boxing-poings-orange.png",
    'boxing/pieds-genoux': "../../../assets/icon/boxing-pieds-poings-genoux-orange.png",
    'boxing/pieds-poings-genoux': "../../../assets/icon/boxing-pieds-genoux-orange.png"
};

  descriptions: any = {
    'training': "Découvrez notre sélection de vidéos d'entrainement",
    'boxing': "Découvrez notre sélection de vidéos de boxe",
  }

  
  constructor(
    private router: Router,
    private vs: VideoService
  ) { }

  ngOnInit() {
    // 1. the parameter from the url
    this.group = this.router.url.split('/').pop()

    // 2. Load the video hiearchy data
    this.vs.onVideoHiearchy(true, true)
      //.pipe(distinctUntilKeyChanged('group'))
      .subscribe((data)=>{
        /*console.log("Load video hiearchy data")
        console.log(data)
        console.log(data[this.group])*/
        this.menuItems = data[this.group]
      })
  }

}
