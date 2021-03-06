import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { isIOS, isAndroid } from 'tns-core-modules/platform';
import * as app from 'tns-core-modules/application';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { Hashtag } from '~/app/models/hashtag';
import * as frame from 'tns-core-modules/ui/frame';
import * as utils from 'tns-core-modules/utils/utils';
import { MyHashtag } from '~/app/models/my-hashtag';
import { UserService } from '~/app/storages/user.service';
import { Photo } from '~/app/models/photo';
import { disableIosSwipe } from '~/app/shared/status-bar-util';
import { RouterExtensions } from 'nativescript-angular/router';

@Component({
  selector: 'ns-myhashtags',
  templateUrl: './myhashtags.component.html',
  styleUrls: ['./myhashtags.component.scss'],
  moduleId: module.id
})
export class MyhashtagsComponent implements OnInit {

  public hashtagsOwn: MyHashtag[] = [];
  public hashtagsGenerated: Hashtag[] = [];
  public headerHeight: number = 0;
  public headerTop: number = 0;
  public isIOS: boolean;

  constructor(
    private readonly page: Page,
    private readonly router: RouterExtensions,
    private readonly userService: UserService
  ) {
    this.page.actionBarHidden = true;
    this.isIOS = isIOS;
    disableIosSwipe(this.page, frame);
    this.calcHeader();
  }

  public ngOnInit(): void {
    this.loadOwnHashtags();
    this.loadPhotoHashtags();
  }

  private loadOwnHashtags(): void {
    const favorites = this.userService.getFavorites();
    favorites.forEach(favorit => {
      this.hashtagsOwn.push(favorit);
    });
  }

  private loadPhotoHashtags(): void {
    const photos = this.userService.getPhotos();
    photos.forEach(photo => {
      photo.selectedHashtags.forEach(tag => {
        if (Photo.isHashtagPartOfAnyCategory(photo, tag.title)) {
          this.hashtagsGenerated.push(tag);
        }
      });
    });
  }

  public goPrevPage(): void {
    if (this.router.canGoBack()) {
      this.router.back();
    }
  }

  public dismissSoftKeyboard(): void {
    if (isIOS) {
      frame.Frame.topmost().nativeView.endEditing(true);
    }
    if (isAndroid) {
      utils.ad.dismissSoftInput();
    }
  }

  public addHashtag(hashtag: Hashtag): void {
    const exist =
      this.hashtagsOwn.filter(
        x => x.title.toLowerCase() === hashtag.title.toLowerCase()
      )[0] !== undefined;
    if (exist) {
      const index = this.hashtagsOwn
        .map(x => x.title.toLowerCase() === hashtag.title.toLowerCase())
        .indexOf(true);
      this.hashtagsOwn.splice(index, 1);
    }
    this.hashtagsOwn.unshift(new MyHashtag(hashtag.title, 1, 'own'));
    this.userService.setFavorites(this.hashtagsOwn);
  }

  private calcHeader(): void {
    const data = this.userService.calcHeader(1080, 416, 140);
    this.headerHeight = data.height;
    this.headerTop = data.top;
  }

}
