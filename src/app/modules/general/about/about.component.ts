import {Component} from '@angular/core';

const packageJsonObject = require('../../../../../package.json');

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {

  public appVersion: string = packageJsonObject.version;

}
