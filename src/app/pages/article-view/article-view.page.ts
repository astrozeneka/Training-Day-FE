import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ContentService} from "../../content.service";

@Component({
  selector: 'app-article-view',
  templateUrl: './article-view.page.html',
  styleUrls: ['./article-view.page.scss'],
})
export class ArticleViewPage implements OnInit {
  post:any = undefined
  rounded_rating = 0

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contentService: ContentService
  ) {
    this.route.params.subscribe(params=>{
      let id = params['id']
      this.contentService.getOne(`/posts/content/${id}`, {})
        .subscribe((post:any)=>{
          this.post = post
          this.rounded_rating = Math.floor(parseFloat(post.rate) * 2) / 2
          console.debug(this.rounded_rating)
          console.debug("Receive data from the server")
          console.debug(this.post)
        })
    })
  }

  ngOnInit() {
  }

  protected readonly Math = Math;
}
