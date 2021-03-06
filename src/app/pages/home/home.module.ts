import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { ProgressBarModule } from '~/app/shared/progress-bar/progress-bar.module';
import { FloatLabelModule } from '~/app/shared/float-label/float-label.module';
import { NativeScriptUISideDrawerModule } from 'nativescript-ui-sidedrawer/angular';
import { NativeScriptUIListViewModule } from 'nativescript-ui-listview/angular';
import { NativeScriptUICalendarModule } from 'nativescript-ui-calendar/angular';
import { NativeScriptUIChartModule } from 'nativescript-ui-chart/angular';
import { NativeScriptUIDataFormModule } from 'nativescript-ui-dataform/angular';
import { NativeScriptUIAutoCompleteTextViewModule } from 'nativescript-ui-autocomplete/angular';
import { NativeScriptUIGaugeModule } from 'nativescript-ui-gauge/angular';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { HistoryModule } from './history/history.module';
import { HomeComponent } from './home.component';
import { LoadingHashtagsComponent } from './loading-hashtags/loading-hashtags.component';
import { NativeScriptLocalizeModule } from 'nativescript-localize/angular';
import { ConfirmImageComponent } from './confirm-image/confirm-image.component';
import { HashtagModule } from '../../shared/hashtag/hashtag.module';
import { setStatusBarColors } from '~/app/shared/status-bar-util';
import { LeaveFeedbackModule } from './leave-feedback/leave-feedback.module';
import { ResultsModule } from './results/results.module';
import { ModalModule } from '~/app/shared/modal/modal.module';
import { CircularProgressBarModule } from '~/app/shared/circular-progress-bar/circular-progress-bar.module';
setStatusBarColors();

@NgModule({
  imports: [
    NativeScriptCommonModule,
    HomeRoutingModule,
    ProgressBarModule,
    FloatLabelModule,
    NativeScriptUISideDrawerModule,
    NativeScriptUIListViewModule,
    NativeScriptUICalendarModule,
    NativeScriptUIChartModule,
    NativeScriptUIDataFormModule,
    NativeScriptUIAutoCompleteTextViewModule,
    NativeScriptUIGaugeModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    HistoryModule,
    HashtagModule,
    LeaveFeedbackModule,
    ResultsModule,
    CircularProgressBarModule,
    ModalModule
  ],
  declarations: [
    HomeComponent,
    LoadingHashtagsComponent,
    ConfirmImageComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  entryComponents: []
})
export class HomeModule {}
