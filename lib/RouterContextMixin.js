'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _URLUtils = require('./URLUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var func = _propTypes2.default.func,
    object = _propTypes2.default.object;


function pathnameIsActive(pathname, activePathname) {
  if ((0, _URLUtils.stripLeadingSlashes)(activePathname).indexOf((0, _URLUtils.stripLeadingSlashes)(pathname)) === 0) return true; // This quick comparison satisfies most use cases.

  // TODO: Implement a more stringent comparison that checks
  // to see if the pathname matches any routes (and params)
  // in the currently active branch.

  return false;
}

function queryIsActive(query, activeQuery) {
  if (activeQuery == null) return query == null;

  if (query == null) return true;

  for (var p in query) {
    if (query.hasOwnProperty(p) && String(query[p]) !== String(activeQuery[p])) return false;
  }return true;
}

var RouterContextMixin = {

  propTypes: {
    stringifyQuery: func.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      stringifyQuery: _URLUtils.stringifyQuery
    };
  },


  childContextTypes: {
    router: object.isRequired
  },

  getChildContext: function getChildContext() {
    return {
      router: this
    };
  },


  /**
   * Returns a full URL path from the given pathname and query.
   */
  makePath: function makePath(pathname, query) {
    if (query) {
      if (typeof query !== 'string') query = this.props.stringifyQuery(query);

      if (query !== '') return pathname + '?' + query;
    }

    return pathname;
  },


  /**
   * Returns a string that may safely be used to link to the given
   * pathname and query.
   */
  makeHref: function makeHref(pathname, query) {
    var path = this.makePath(pathname, query);
    var history = this.props.history;


    if (history && history.makeHref) return history.makeHref(path);

    return path;
  },


  /**
   * Pushes a new Location onto the history stack.
   */
  transitionTo: function transitionTo(pathname, query) {
    var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var history = this.props.history;


    (0, _invariant2.default)(history, 'Router#transitionTo is client-side only (needs history)');

    history.pushState(state, this.makePath(pathname, query));
  },


  /**
   * Replaces the current Location on the history stack.
   */
  replaceWith: function replaceWith(pathname, query) {
    var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var history = this.props.history;


    (0, _invariant2.default)(history, 'Router#replaceWith is client-side only (needs history)');

    history.replaceState(state, this.makePath(pathname, query));
  },


  /**
   * Navigates forward/backward n entries in the history stack.
   */
  go: function go(n) {
    var history = this.props.history;


    (0, _invariant2.default)(history, 'Router#go is client-side only (needs history)');

    history.go(n);
  },


  /**
   * Navigates back one entry in the history stack. This is identical to
   * the user clicking the browser's back button.
   */
  goBack: function goBack() {
    this.go(-1);
  },


  /**
   * Navigates forward one entry in the history stack. This is identical to
   * the user clicking the browser's forward button.
   */
  goForward: function goForward() {
    this.go(1);
  },


  /**
   * Returns true if a <Link> to the given pathname/query combination is
   * currently active.
   */
  isActive: function isActive(pathname, query) {
    var location = this.state.location;


    if (location == null) return false;

    return pathnameIsActive(pathname, location.pathname) && queryIsActive(query, location.query);
  }
};

exports.default = RouterContextMixin;