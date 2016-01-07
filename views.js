import { BaseComponent } from './components';

export class BaseView extends BaseComponent {
  get controller() {
    return this.props.controller;
  }
}
