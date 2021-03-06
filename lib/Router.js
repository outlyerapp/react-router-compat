'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _AsyncUtils = require('./AsyncUtils');

var _RouteUtils = require('./RouteUtils');

var _RoutingUtils = require('./RoutingUtils');

var _PropTypes = require('./PropTypes');

var _RouterContextMixin = require('./RouterContextMixin');

var _RouterContextMixin2 = _interopRequireDefault(_RouterContextMixin);

var _ScrollManagementMixin = require('./ScrollManagementMixin');

var _ScrollManagementMixin2 = _interopRequireDefault(_ScrollManagementMixin);

var _Location = require('./Location');

var _Location2 = _interopRequireDefault(_Location);

var _Transition = require('./Transition');

var _Transition2 = _interopRequireDefault(_Transition);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var arrayOf = _propTypes2.default.arrayOf,
    func = _propTypes2.default.func,
    object = _propTypes2.default.object;


function runTransition(prevState, routes, location, hooks, callback) {
  var transition = new _Transition2.default();

  (0, _RoutingUtils.getState)(routes, location, function (error, nextState) {
    if (error || nextState == null || transition.isCancelled) {
      callback(error, null, transition);
    } else {
      nextState.location = location;

      var transitionHooks = (0, _RoutingUtils.getTransitionHooks)(prevState, nextState);
      if (Array.isArray(hooks)) transitionHooks.unshift.apply(transitionHooks, hooks);

      (0, _AsyncUtils.loopAsync)(transitionHooks.length, function (index, next, done) {
        transitionHooks[index](nextState, transition, function (error) {
          if (error || transition.isCancelled) {
            done(error); // No need to continue.
          } else {
            next();
          }
        });
      }, function (error) {
        if (error || transition.isCancelled) {
          callback(error, null, transition);
        } else {
          (0, _RoutingUtils.getComponents)(nextState.branch, function (error, components) {
            if (error || transition.isCancelled) {
              callback(error, null, transition);
            } else {
              nextState.components = components;
              callback(null, nextState, transition);
            }
          });
        }
      });
    }
  });
}

var Router = (0, _createReactClass2.default)({

  mixins: [_RouterContextMixin2.default, _ScrollManagementMixin2.default],

  statics: {

    /**
     * Runs a transition to the given location using the given routes and
     * transition hooks (optional) and calls callback(error, state, transition)
     * when finished. This is primarily useful for server-side rendering.
     */
    run: function run(routes, location, transitionHooks, callback) {
      if (typeof transitionHooks === 'function') {
        callback = transitionHooks;
        transitionHooks = null;
      }

      (0, _invariant2.default)(typeof callback === 'function', 'Router.run needs a callback');

      runTransition(null, routes, location, transitionHooks, callback);
    }
  },

  propTypes: {
    createElement: func.isRequired,
    onAbort: func,
    onError: func,
    onUpdate: func,

    // Client-side
    history: _PropTypes.history,
    routes: _PropTypes.routes,
    // Routes may also be given as children (JSX)
    children: _PropTypes.routes,

    // Server-side
    location: _PropTypes.location,
    branch: _PropTypes.routes,
    params: object,
    components: arrayOf(_PropTypes.components)
  },

  getDefaultProps: function getDefaultProps() {
    return {
      createElement: _react.createElement
    };
  },
  getInitialState: function getInitialState() {
    return {
      isTransitioning: false,
      location: null,
      branch: null,
      params: null,
      components: null
    };
  },
  _updateState: function _updateState(location) {
    var _this = this;

    (0, _invariant2.default)(_Location2.default.isLocation(location), 'A <Router> needs a valid Location');

    var hooks = this.transitionHooks;
    if (hooks) hooks = hooks.map(function (hook) {
      return (0, _RoutingUtils.createTransitionHook)(hook, _this);
    });

    this.setState({ isTransitioning: true });

    runTransition(this.state, this.routes, location, hooks, function (error, state, transition) {
      if (error) {
        _this.handleError(error);
      } else if (transition.isCancelled) {
        if (transition.redirectInfo) {
          var _transition$redirectI = transition.redirectInfo,
              pathname = _transition$redirectI.pathname,
              query = _transition$redirectI.query,
              state = _transition$redirectI.state;

          _this.replaceWith(pathname, query, state);
        } else {
          (0, _invariant2.default)(_this.state.location, 'You may not abort the initial transition');

          _this.handleAbort(transition.abortReason);
        }
      } else if (state == null) {
        (0, _warning2.default)(false, 'Location "%s" did not match any routes', location.pathname);
      } else {
        _this.setState(state, _this.props.onUpdate);
      }

      _this.setState({ isTransitioning: false });
    });
  },


  /**
   * Adds a transition hook that runs before all route hooks in a
   * transition. The signature is the same as route transition hooks.
   */
  addTransitionHook: function addTransitionHook(hook) {
    if (!this.transitionHooks) this.transitionHooks = [];

    this.transitionHooks.push(hook);
  },


  /**
   * Removes the given transition hook.
   */
  removeTransitionHook: function removeTransitionHook(hook) {
    if (this.transitionHooks) this.transitionHooks = this.transitionHooks.filter(function (h) {
      return h !== hook;
    });
  },
  handleAbort: function handleAbort(reason) {
    if (this.props.onAbort) {
      this.props.onAbort.call(this, reason);
    } else {
      // The best we can do here is goBack so the location state reverts
      // to what it was. However, we also set a flag so that we know not
      // to run through _updateState again since state did not change.
      this._ignoreNextHistoryChange = true;
      this.goBack();
    }
  },
  handleError: function handleError(error) {
    if (this.props.onError) {
      this.props.onError.call(this, error);
    } else {
      // Throw errors by default so we don't silently swallow them!
      throw error; // This error probably originated in getChildRoutes or getComponents.
    }
  },
  handleHistoryChange: function handleHistoryChange() {
    if (this._ignoreNextHistoryChange) {
      this._ignoreNextHistoryChange = false;
    } else {
      this._updateState(this.props.history.location);
    }
  },
  componentWillMount: function componentWillMount() {
    var _props = this.props,
        history = _props.history,
        routes = _props.routes,
        children = _props.children,
        location = _props.location,
        branch = _props.branch,
        params = _props.params,
        components = _props.components;


    if (history) {
      (0, _invariant2.default)(routes || children, 'Client-side <Router>s need routes. Try using <Router routes> or ' + 'passing your routes as nested <Route> children');

      this.routes = (0, _RouteUtils.createRoutes)(routes || children);

      if (typeof history.setup === 'function') history.setup();

      // We need to listen first in case we redirect immediately.
      if (history.addChangeListener) history.addChangeListener(this.handleHistoryChange);

      this._updateState(history.location);
    } else {
      (0, _invariant2.default)(location && branch && params && components, 'Server-side <Router>s need location, branch, params, and components ' + 'props. Try using Router.run to get all the props you need');

      this.setState({ location: location, branch: branch, params: params, components: components });
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    (0, _invariant2.default)(this.props.history === nextProps.history, '<Router history> may not be changed');

    if (nextProps.history) {
      var currentRoutes = this.props.routes || this.props.children;
      var nextRoutes = nextProps.routes || nextProps.children;

      if (currentRoutes !== nextRoutes) {
        this.routes = (0, _RouteUtils.createRoutes)(nextRoutes);

        // Call this here because _updateState
        // uses this.routes to determine state.
        if (nextProps.history.location) this._updateState(nextProps.history.location);
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    var history = this.props.history;


    if (history && history.removeChangeListener) history.removeChangeListener(this.handleHistoryChange);
  },
  _createElement: function _createElement(component, props) {
    return typeof component === 'function' ? this.props.createElement(component, props) : null;
  },
  render: function render() {
    var _this2 = this;

    var _state = this.state,
        branch = _state.branch,
        params = _state.params,
        components = _state.components;

    var element = null;

    if (components) {
      element = components.reduceRight(function (element, components, index) {
        if (components == null) return element; // Don't create new children; use the grandchildren.

        var route = branch[index];
        var routeParams = (0, _RoutingUtils.getRouteParams)(route, params);
        var props = Object.assign({}, _this2.state, { route: route, routeParams: routeParams });

        if ((0, _react.isValidElement)(element)) {
          props.children = element;
        } else if (element) {
          // In render, do var { header, sidebar } = this.props;
          Object.assign(props, element);
        }

        if ((typeof components === 'undefined' ? 'undefined' : _typeof(components)) === 'object') {
          var elements = {};

          for (var key in components) {
            if (components.hasOwnProperty(key)) elements[key] = _this2._createElement(components[key], props);
          }return elements;
        }

        return _this2._createElement(components, props);
      }, element);
    }

    (0, _invariant2.default)(element === null || element === false || (0, _react.isValidElement)(element), 'The root route must render a single element');

    return element;
  }
});

exports.default = Router;