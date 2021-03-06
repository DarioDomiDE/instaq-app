import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { Page } from 'tns-core-modules/ui/page';
import { ModalDialogService, ModalDialogOptions } from 'nativescript-angular/modal-dialog';
import { ModalComponent } from '~/app/shared/modal/modal.component';
import * as utils from 'tns-core-modules/utils/utils';
import { isIOS, isAndroid } from 'tns-core-modules/platform';
import * as frame from 'tns-core-modules/ui/frame';
import { AppFeedback } from '~/app/models/app-feedback';
import { CustomerService } from '~/app/storages/customer.service';
import { FeedbackRepository } from '~/app/services/repositories/feedback-repository.service';

@Component({
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  moduleId: module.id
})
export class FeedbackComponent implements OnInit {

  public email = '';
  public message = '';

  constructor(
    private readonly page: Page,
    private readonly router: RouterExtensions,
    private readonly modalService: ModalDialogService,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly feedbackRepositoryService: FeedbackRepository,
    private readonly customerService: CustomerService,
  ) {
    this.page.actionBarHidden = true;
  }

  public ngOnInit(): void {
  }

  public sendFeedback(): void {
    if (this.email === '' && this.message === '') {
      console.log('empty');
      return;
    }
    const feedback: AppFeedback = new AppFeedback({
      customerId: this.customerService.getCustomerId(),
      email: this.email,
      message: this.message
    });
    this.feedbackRepositoryService.sendAppFeedback(feedback);

    const options: ModalDialogOptions = {
      viewContainerRef: this.viewContainerRef,
      fullscreen: false,
      context: {
        icon: 'copied',
        headline: 'feedback_successful_headline',
        desc: 'feedback_successful_desc',
        buttonOk: 'feedback_modal_button'
      }
    };
    this.modalService.showModal(ModalComponent, options);
  }

  public dismissSoftKeyboard(): void {
    if (isIOS) {
      frame.Frame.topmost().nativeView.endEditing(true);
    }
    if (isAndroid) {
      utils.ad.dismissSoftInput();
    }
  }

  public emailChange(text: string): void {
    this.email = text;
  }

  public messageChange(text: string): void {
    this.message = text;
  }

  public goPrevPage(): void {
    if (this.router.canGoBack()) {
      this.router.back();
    }
  }
}
