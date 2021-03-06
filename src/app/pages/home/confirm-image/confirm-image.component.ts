import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { DeviceService } from '~/app/services/device-photos.service';
import { ImageAsset } from 'tns-core-modules/image-asset/image-asset';
import { Page } from 'tns-core-modules/ui/page/page';
import { ToastDuration, Toasty } from 'nativescript-toasty';
import { localize } from 'nativescript-localize/angular';
import { SelectPhotoService } from '~/app/services/business-logic/select-photo.service';
import { UserService } from '~/app/storages/user.service';
import { disableIosSwipe } from '~/app/shared/status-bar-util';
import * as frame from 'tns-core-modules/ui/frame';

@Component({
  selector: 'ns-confirm-image',
  templateUrl: './confirm-image.component.html',
  styleUrls: ['./confirm-image.component.scss'],
  moduleId: module.id,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmImageComponent implements OnInit {

  public photo: ImageAsset;
  @Output() public onClickCancel = new EventEmitter<void>();

  constructor(
    private readonly page: Page,
    private readonly router: RouterExtensions,
    private readonly deviceService: DeviceService,
    private readonly selectPhotoService: SelectPhotoService,
    private readonly cd: ChangeDetectorRef,
    private readonly userService: UserService,
    private readonly ngZone: NgZone
  ) {
    this.cd.detach();
    this.page.actionBarHidden = true;
    disableIosSwipe(this.page, frame);
  }

  public ngOnInit(): void {
    this.loadImage();
  }

  public loadImage(): void {
    this.photo = this.deviceService.getSelectedPhoto();
    this.cd.detectChanges();
  }

  public confirmImage(): void {
    this.openLoadingPage();
    this.selectPhotoService.saveAndUploadPhoto().subscribe((photoId) => {
      this.ngZone.run(() => {
        this.openResultsPage(photoId);
        this.userService.uploadCompletedTriggered.emit();
        this.cd.detectChanges();
      });
    }, (e) => {
      this.ngZone.run(() => {
        console.log('ERROR', e);
        const locaKey = e === 'customer failed' ? 'toast_create_customer_at_upload_failed' : 'toast_upload_failed';
        const text = localize(locaKey);
        new Toasty({ text: text })
          .setToastDuration(ToastDuration.LONG)
          .show();
        setTimeout.bind(this)(() => {
          // event for canceling
          this.userService.uploadFailedTriggered.emit();
        }, 1000);
      });
    });
  }

  public chooseImage(): void {
    this.selectPhotoService.pickImage().subscribe((image) => {
      this.photo = image;
      this.cd.detectChanges();
    });
  }

  public goPrevPage(): void {
    this.onClickCancel.emit();
  }

  private openLoadingPage(): void {
    this.router.navigate([`/home/loading-hashtags`], {
      transition: {
        name: 'FadeIn',
        duration: 500,
        curve: 'easeOut'
      }
    });
  }

  private openResultsPage(id: number): void {
    this.router.navigate([`/home/results/${id}`], {
      transition: {
        name: 'FadeIn',
        duration: 500,
        curve: 'easeOut'
      }
    });
  }

}
