import Backbone from 'backbone';


export class BaseModel extends Backbone.Model {
  url() {
    var baseUrl = super.url();
    if (!baseUrl.match(/\/$/)) {
      return `${baseUrl}/`;
    }
    return baseUrl;
  }

  toJSON() {
    var serialized = {};
    var proto = Reflect.getPrototypeOf(this);
    for (let name of Reflect.ownKeys(proto)) {
      if (Reflect.getOwnPropertyDescriptor(proto, name).get) {
        serialized[name] = this[name];
      }
    }
    return serialized;
  }

  updateFromProps(props) {
    var proto = Reflect.getPrototypeOf(this);
    var hasProps = false;
    for (let name of Reflect.ownKeys(proto)) {
      if (Reflect.getOwnPropertyDescriptor(proto, name).set) {
        if (props[name] !== undefined) {
          this[name] = props[name];
          hasProps = true;
        }
      }
    }
    if (!hasProps) {
      var protoBase = Reflect.getPrototypeOf(proto);
      for (let name of Reflect.ownKeys(protoBase)) {
        if (Reflect.getOwnPropertyDescriptor(protoBase, name).set) {
          this[name] = props[name];
        }
      }
    }

  }
}
