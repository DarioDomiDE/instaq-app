import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import * as imagepicker from 'nativescript-imagepicker';
import { ToastDuration, Toasty } from 'nativescript-toasty';
import { localize } from 'nativescript-localize/angular';
import { DeviceService } from '../device-photos.service';
import { CustomerService, CustomerCreateStatus } from '../../storages/customer.service';
import { UserService } from '~/app/storages/user.service';
import { PhotosCountService } from '~/app/storages/photos-count.service';
import { EvaluationRepository } from '../repositories/evaluation-repository.service';
import { Photo } from '~/app/models/photo';
import { IHttpResponse } from '~/app/models/request/http-response';
import { HashtagCategory } from '~/app/models/hashtag-category';
import { Subscriber } from 'rxjs';
import { HashtagResult } from '~/app/models/hashtag-result';

@Injectable({
  providedIn: 'root',
})

export class SelectPhotoService {

  constructor(
    private readonly deviceService: DeviceService,
    private readonly customerService: CustomerService,
    private readonly userService: UserService,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly photosCountService: PhotosCountService,
  ) { }

  public pickImage(): Observable<any> {
    return new Observable<any>(observer => {
    const that = this;
    const context = imagepicker.create({
      mode: 'single',
      mediaType: imagepicker.ImagePickerMediaType.Image
    });
    context
      .authorize()
      .then(function(): any {
        return context.present();
      })
      .then(function(selection): void {
        console.log('image picker successful', selection);
        const image = selection[0];
        image.options.width = 1000;
        image.options.height = 1000;
        that.deviceService.setSelectedPhoto(image);
        observer.next(image);
        observer.complete();
      }).catch(err => {
        console.log('image picker error: ', err);
        if (err.toString().substr(err.toString().length - 13) !== 'result code 0') {
          const text = localize('toast_imagepicker_failed');
          new Toasty({ text: text })
            .setToastDuration(ToastDuration.LONG)
            .show();
        }
        observer.error(err);
        observer.complete();
      });
    });
  }

  public saveAndUploadPhoto(): Observable<any> {
    return new Observable<any>(observer => {
      this.savePhoto().subscribe(photoId => {
        const hasCustomerId = this.customerService.hasCustomerId();
        if (!hasCustomerId) {
            this.customerService.createUserIdIfNotExist().subscribe((status) => {
            if (status === CustomerCreateStatus.NewlyCreated || status === CustomerCreateStatus.AlreadyCreated) {
              this.uploadImage(photoId, observer);
            } else {
              observer.error('customer failed');
              observer.complete();
            }
            });
        } else {
          this.uploadImage(photoId, observer);
        }
      });
    });
  }

  private savePhoto(): Observable<number> {
    return new Observable<number>(observer => {
      const selectedPhoto = this.deviceService.getSelectedPhoto();
      this.deviceService.copyPhotoToAppFolder(selectedPhoto).subscribe(path => {
        const photo = new Photo();
        photo.timestamp = new Date().getTime();
        photo.image = path;
        const photoId = this.userService.addPhoto(photo);
        observer.next(photoId);
        observer.complete();
      });
    });
  }

  private uploadImage(photoId: number, observer: Subscriber<any>): void {
    const customerId = this.customerService.getCustomerId();
    const photo = this.userService.getPhoto(photoId);
    this.evaluationRepository.uploadPhoto(photo.image, customerId)
    .subscribe((httpResponse: IHttpResponse) => {
      console.log(httpResponse);
      // iOS uses -1 (not 200) at successful requests
      if (httpResponse.status === 'successful') {
        const httpResult = this.parseSuccessfulResponse(httpResponse);
        if (httpResult.logId !== undefined) {
          this.storeHttpResultIntoPhoto(photoId, httpResult);
          const remaining = this.photosCountService.getRemainingCount();
          if (remaining >= 1) {
            this.photosCountService.decrease();
          }
          observer.next(photoId);
          observer.complete();
          return;
        }
      }
      observer.error('upload failed');
      observer.complete();
    });
  }

  private parseSuccessfulResponse(httpResponse: IHttpResponse): {categories: HashtagCategory[], logId: number} {
    const data = JSON.parse(httpResponse.message);
    const mostRelevantTags: HashtagResult[] = data.mostRelevantHTags;
    const trendingTags: HashtagResult[] = data.trendingHTags;
    const categories: HashtagCategory[] = [];
    categories.push(HashtagCategory.fromHashtagResult(mostRelevantTags, 'results_category_generic_hashtags'));
    categories.push(HashtagCategory.fromHashtagResult(trendingTags, 'results_category_niche_hashtags'));
    return { categories: categories, logId: data.logId };
  }

  private storeHttpResultIntoPhoto(photoId: number, httpResult: {categories: HashtagCategory[], logId: number}): void {
    const photo = this.userService.getPhoto(photoId);
    photo.categories = httpResult.categories;
    photo.logId = httpResult.logId;
    photo.proMode = this.photosCountService.getRemainingCount() >= 1;
    photo.censorHashtags();
    this.userService.updatePhoto(photo);
  }

}