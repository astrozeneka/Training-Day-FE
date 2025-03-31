import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-by-category',
  templateUrl: './video-by-category.page.html',
  styleUrls: ['./video-by-category.page.scss'],
})
export class VideoByCategoryPage implements OnInit {

  category: string = undefined

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    // 1. the parameter from the url
    this.category = this.router.url.split('/').pop()
  }

}
