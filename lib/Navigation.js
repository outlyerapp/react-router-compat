'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var object = _propTypes2.default.object;

/**
 * A mixin for components that modify the URL.
 *
 * Example:
 *
 *   import { Navigation } from 'react-router';
 *
 *   var MyLink = createReactClass({
 *     mixins: [ Navigation ],
 *     handleClick(event) {
 *       event.preventDefault();
 *       this.transitionTo('aRoute', { the: 'params' }, { the: 'query' });
 *     },
 *     render() {
 *       return (
 *         <a onClick={this.handleClick}>Click me!</a>
 *       );
 *     }
 *   });
 */

var Navigation = {

  contextTypes: {
    router: object.isRequired
  }

};

var RouterNavigationMethods = ['makePath', 'makeHref', 'transitionTo', 'replaceWith', 'go', 'goBack', 'goForward'];

RouterNavigationMethods.forEach(function (method) {
  Navigation[method] = function () {
    var router = this.context.router;
    return router[method].apply(router, arguments);
  };
});

exports.default = Navigation;