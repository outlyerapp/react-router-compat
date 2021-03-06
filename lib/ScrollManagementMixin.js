'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _DOMUtils = require('./DOMUtils');

var _NavigationTypes = require('./NavigationTypes');

var _NavigationTypes2 = _interopRequireDefault(_NavigationTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var func = _propTypes2.default.func;


function getCommonAncestors(branch, otherBranch) {
  return branch.filter(function (route) {
    return otherBranch.indexOf(route) !== -1;
  });
}

function shouldUpdateScrollPosition(state, prevState) {
  var location = state.location,
      branch = state.branch;
  var prevLocation = prevState.location,
      prevBranch = prevState.branch;

  // When an onEnter hook uses transition.to to redirect
  // on the initial load prevLocation is null, so assume
  // we don't want to update the scroll position.

  if (prevLocation === null) return false;

  // Don't update scroll position if only the query has changed.
  if (location.pathname === prevLocation.pathname) return false;

  // Don't update scroll position if any of the ancestors
  // has `ignoreScrollPosition` set to `true` on the route.
  var sharedAncestors = getCommonAncestors(branch, prevBranch);
  if (sharedAncestors.some(function (route) {
    return route.ignoreScrollBehavior;
  })) return false;

  return true;
}

function updateWindowScrollPosition(navigationType, scrollX, scrollY) {
  if (_DOMUtils.canUseDOM) {
    if (navigationType === _NavigationTypes2.default.POP) {
      (0, _DOMUtils.setWindowScrollPosition)(scrollX, scrollY);
    } else {
      (0, _DOMUtils.setWindowScrollPosition)(0, 0);
    }
  }
}

var ScrollManagementMixin = {

  propTypes: {
    shouldUpdateScrollPosition: func.isRequired,
    updateScrollPosition: func.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      shouldUpdateScrollPosition: shouldUpdateScrollPosition,
      updateScrollPosition: updateWindowScrollPosition
    };
  },
  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    var location = this.state.location;

    var locationState = location && location.state;

    if (locationState && this.props.shouldUpdateScrollPosition(this.state, prevState)) {
      var scrollX = locationState.scrollX,
          scrollY = locationState.scrollY;

      this.props.updateScrollPosition(location.navigationType, scrollX || 0, scrollY || 0);
    }
  }
};

exports.default = ScrollManagementMixin;