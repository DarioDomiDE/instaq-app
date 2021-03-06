import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page';
import * as app from 'tns-core-modules/application';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { screen } from 'tns-core-modules/platform';
import { SelectPhotoService } from '../../services/business-logic/select-photo.service';
import { UserService } from '~/app/storages/user.service';
import { Photo } from '~/app/models/photo';
import { Subscription } from 'rxjs';
import { exit } from 'nativescript-exit';
import { ToastDuration, Toasty } from 'nativescript-toasty';
import { localize } from 'nativescript-localize/angular';
// import * as frame from 'tns-core-modules/ui/frame';
// import { disableIosSwipe } from '~/app/shared/status-bar-util';
import { RouterExtensions } from 'nativescript-angular/router';
import { isIOS, isAndroid } from 'tns-core-modules/platform';
const permissions = require('nativescript-permissions');

@Component({
  moduleId: module.id,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {

  public isHistoryOpen: number;
  public historyHeight: number;
  public historyDefaultTransform: number;
  public headerDefaultTransform: number;
  public showConfirmImage: boolean;
  public isIOS: boolean;
  public headerHeight: number = 0;
  public headerTop: number = 0;
  @ViewChild('history', { read: ElementRef, static: false }) public historyElement: ElementRef;
  @ViewChild('header', { read: ElementRef, static: false }) public headerElement: ElementRef;
  @ViewChild('mainContainer', { read: ElementRef, static: false }) public mainContainerElement: ElementRef;
  @Output() public historyOpenChanged: EventEmitter<boolean> = new EventEmitter();

  private photoAddedSubscription: Subscription;
  private appRatedSubscription: Subscription;
  private androidBackTriggeredSubscription: Subscription;
  private backTriggeredForExit: boolean;

  constructor(
    private readonly page: Page,
    private readonly selectPhotoService: SelectPhotoService,
    private readonly userService: UserService,
    private readonly cd: ChangeDetectorRef,
    private readonly router: RouterExtensions
  ) {
    this.cd.detach();
    this.page.actionBarHidden = true;
    this.page.enableSwipeBackNavigation = false;
    this.isIOS = isIOS;
    this.calcHeader();
    // leads to Crash in NativeScript 6.2 etc.
    // disableIosSwipe(this.page, frame);
  }

  public ngOnInit(): void {
    this.historyHeight = screen.mainScreen.heightDIPs - 90;
    this.historyDefaultTransform = this.historyHeight - 140;
    this.headerDefaultTransform = -50;

    this.photoAddedSubscription = this.userService.photoAdded.subscribe((photos: Photo[]) => {
      this.cd.detectChanges();
    });
    this.appRatedSubscription = this.userService.appRatedTriggered.subscribe(() => {
      this.cd.detectChanges();
      setTimeout.bind(this)(() => {
        this.cd.detectChanges();
      }, 100);
    });
    this.androidBackTriggeredSubscription = this.userService.androidBackTriggered.subscribe((path: string) => this.onAndroidBackTriggered(path));
    this.cd.detectChanges();
  }

  public ngOnDestroy(): void {
    if (!!this.photoAddedSubscription) {
      this.photoAddedSubscription.unsubscribe();
    }
    if (!!this.androidBackTriggeredSubscription) {
      this.androidBackTriggeredSubscription.unsubscribe();
    }
    if (!!this.appRatedSubscription) {
      this.appRatedSubscription.unsubscribe();
    }
  }

  public clickSelectPhoto(): void {
    if (isAndroid) {
      permissions.requestPermission((global as any).android.Manifest.permission.READ_EXTERNAL_STORAGE, 'Need permissions to access photos for finding best hashtags.')
      .then(() => {
        this.selectPhotoService.pickImage().subscribe(() => {
          this.showConfirmImage = true;
          this.cd.detectChanges();
        });
      })
      .catch(() => {
        const text = localize('toast_imagepicker_failed');
        new Toasty({ text: text })
        .setToastDuration(ToastDuration.LONG)
        .show();
      });
    } else {
      this.selectPhotoService.pickImage().subscribe(() => {
        this.showConfirmImage = true;
        this.cd.detectChanges();
      });
    }
    this.backTriggeredForExit = false;
  }

  public clickTipsAndTricks(): void {
    this.userService.openPage.emit('tipstricks');
    this.router.navigate([`/faq`], {
      transition: {
        name: 'FadeIn',
        duration: 500,
        curve: 'easeOut'
      }
    });
  }

  public clickSearch(): void {
    this.userService.openPage.emit('search');
    this.router.navigate([`/search`], {
      transition: {
        name: 'FadeIn',
        duration: 500,
        curve: 'easeOut'
      }
    });
  }

  public openMenu(): void {
    // timeout needed or sidemenu will be visible for one frame before fading in
    setTimeout(() => {
      const sideDrawer = <RadSideDrawer>app.getRootView();
      sideDrawer.showDrawer();
      sideDrawer.drawerContentSize = 250;
    }, 10);
    this.backTriggeredForExit = false;
  }

  public clickHistory(): void {
    this.cd.reattach();
    this.isHistoryOpen = this.isHistoryOpen !== 1 ? 1 : 2;
    this.historyOpenChanged.emit(this.isHistoryOpen === 1);
    const time = 600;
    this.animateHistory(time);
    this.animateHeader(time);
    this.backTriggeredForExit = false;
  }

  private animateHistory(time: number): void {
    const posY = this.isHistoryOpen === 1 ? 0 : this.historyDefaultTransform;
    const that = this;
    this.historyElement.nativeElement.animate({
      translate: { x: 0, y: posY},
      duration: time
    }).then(function(): void {
      that.cd.detach();
    });
  }

  private animateHeader(time: number): void {
    const posY = this.isHistoryOpen === 1 ? this.headerDefaultTransform : 0;
    this.headerElement.nativeElement.animate({
      translate: { x: 0, y: posY},
      duration: time
    });
  }

  public clickCancelConfirmImage(): void {
    this.showConfirmImage = false;
    this.cd.detectChanges();
  }

  private onAndroidBackTriggered(path: string): void {
    if (path === '/home') {
      if (this.isHistoryOpen === 1) {
        this.clickHistory();
      } else if (this.showConfirmImage) {
        this.clickCancelConfirmImage();
      } else {
        if (!this.backTriggeredForExit) {
          this.backTriggeredForExit = true;
          const text = localize('exit_warning');
          new Toasty({ text: text })
            .setToastDuration(ToastDuration.LONG)
            .show();
        } else {
          exit();
        }
      }
    }
  }

  private calcHeader(): void {
    const data = this.userService.calcHeader(1080, 574, 218);
    this.headerHeight = data.height;
    this.headerTop = data.top;
  }

}
