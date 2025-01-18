import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import videojs from 'video.js';
import 'videojs-hls-quality-selector';
import '@videojs/http-streaming';  // Import VHS plugin
import * as Hls from 'hls.js';

@Component({
  selector: 'app-video-aws-test',
  templateUrl: './video-aws-test.page.html',
  styleUrls: [
    './video-aws-test.page.scss',
    "../../../../node_modules/video.js/dist/video-js.css"],
  encapsulation: ViewEncapsulation.None // Add this line to change style scope
})
export class VideoAwsTestPage implements OnInit {
  videoPlayer: any;

  constructor(
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    const videoElement:HTMLVideoElement = document.getElementById('my-video') as HTMLVideoElement;
    const hlsSource = "https://trainingday-videos.s3.ap-southeast-1.amazonaws.com/1.La-garde.m3u8"
    console.log(Hls);
    if ((Hls as any).isSupported()) {
      const hls = new Hls.default();
      hls.loadSource(hlsSource);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log("error", event, data);
      })
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      const hls = new Hls.default();
      hls.loadSource(hlsSource);
      hls.attachMedia(videoElement);
    } else {
      console.log("HLS not supported");
    }
    /*
    this.videoPlayer = videojs('my-video', {
      autoplay: true,
      controls: true,
      preload: 'auto',
      responsive: true,
      fluid: true,
      techOrder: ['html5'],
      sources: [{
        src: "https://trainingday-videos.s3.ap-southeast-1.amazonaws.com/1.La-garde.m3u8",
        type: 'application/x-mpegURL'
      }]
    });

    // Enable quality selector plugin
    this.videoPlayer.hlsQualitySelector();
    */
  }
}
