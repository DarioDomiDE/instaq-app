import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page";
import * as app from "tns-core-modules/application";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { screen } from "tns-core-modules/platform";
import * as imagepicker from "nativescript-imagepicker";
import { DeviceService } from "../services/device-photos.service";

class ScreenInfo {
  constructor(
      public heightDIPs: number,
      public heightPixels: number,
      public scale: number,
      public widthDIPs: number,
      public widthPixels: number
  ) { }
}

@Component({
  selector: "Home",
  moduleId: module.id,
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {

  isHistoryOpen: number;
  historyHeight: number;
  historyDefaultTransform: number;
  @ViewChild("history", { static: false }) historyElement: ElementRef;
  @ViewChild("mainContainer", { static: false }) mainContainerElement: ElementRef;

  constructor(
    private readonly page: Page,
    private readonly router: RouterExtensions,
    private readonly deviceService: DeviceService,
  ) {
    this.page.actionBarHidden = true;
  }

  ngOnInit() {
    this.historyHeight = screen.mainScreen.heightDIPs - 90;
    this.historyDefaultTransform = this.historyHeight - 130;
  }

  clickUpload() {

    let that = this;

    let context = imagepicker.create({
      mode: "single",
      mediaType: imagepicker.ImagePickerMediaType.Image
    });
    
    context
      .authorize()
      .then(function() {
          return context.present();
      })
      .then(function(selection) {
        let imageSrc = selection[0];
        imageSrc.options.width = 1000;
        imageSrc.options.height = 1000;
        that.deviceService.setSelectedPhoto(imageSrc);
        that.router.navigate(["/home/confirm-image"]);
        
      }).catch(function (e) {
        // process error
        console.log("IMAGE PICKER Failed: " + e);
      });
  }

  openMenu(): void {
    // timeout as workaround, otherwise the sidemenu will be visible for one frame before fading in
    setTimeout(() => {
      const sideDrawer = <RadSideDrawer>app.getRootView();
      sideDrawer.showDrawer();
      sideDrawer.drawerContentSize = 250;
    }, 10);
  }

  closeMenu() {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.closeDrawer();
  }

  clickHistory() {
    this.isHistoryOpen = this.isHistoryOpen != 1 ? 1 : 2;
    var posY = this.isHistoryOpen === 1 ? 0 : this.historyDefaultTransform;
    var bgColor = this.isHistoryOpen === 1 ? '#fff' :'#fcfcfc';
    this.historyElement.nativeElement.animate({
      translate: { x: 0, y: posY},
      backgroundColor: bgColor,
      duration: 600
    });
  }

}
