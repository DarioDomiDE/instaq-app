import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
declare var CGSizeMake: any;
declare var UIColor: any;

@Component({
  selector: 'ns-hashtag',
  templateUrl: './hashtag.component.html',
  styleUrls: ['./hashtag.component.scss'],
  moduleId: module.id
})
export class HashtagComponent implements OnInit {

  @Input() public name: string;
  @Input() public isActive: boolean;
  @Input() public censored: boolean;
  @Output() public onClick = new EventEmitter<void>();
  @Output() public onClickCensored = new EventEmitter<void>();

  constructor(
    private readonly page: Page
  ) {
  }

  public ngOnInit(): void {
    if (this.censored) {
      const length = this.name.length;
      const trimLength = length > 5 ? 4 : length - 2;
      this.name = this.name.substr(0, trimLength + 1);
      const minAmountOfStars = 4;
      const amountOfStars =
        length - trimLength >= minAmountOfStars
          ? length
          : trimLength + minAmountOfStars;
      for (let i = trimLength; i < amountOfStars; i++) {
        this.name += '*';
      }
    }
  }

  public onLoaded(): void {
    const label = this.page.getViewById('label');
    if (this.page.ios) {
      console.log(UIColor);
      console.log(UIColor.whiteColor);
      const layer = label.ios.layer;
      layer.backgroundColor = UIColor.whiteColor.CGColor;
      // layer.backgroundColor = 'white';
      layer.shadowOffset = CGSizeMake(0, 5);
      layer.shadowOpacity = 0.5;
      layer.shadowRadius = 6;
      layer.cornerRadius = 6;
      // layer.backgroundColor = 'linear-gradient(to right, #E067A9, #FFB184)';
    }
  }

  public triggerClick(): void {
    this.isActive = !this.isActive;
    return;

    if (!this.censored) {
      this.onClick.emit();
    } else {
      this.onClickCensored.emit();
    }
  }
}
