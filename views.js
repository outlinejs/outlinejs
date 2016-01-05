import { BaseComponent } from './components';

export class BaseView extends BaseComponent {
  get controller() {
    return this.props.controller;
  }

  isActive(state, className = 'active') {
    if (this.props && this.props.currentState.indexOf(state) === 0) {
      return className;
    }
  }
}
