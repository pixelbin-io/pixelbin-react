'use strict';

var _extends = require('@babel/runtime/helpers/extends');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var React = require('react');
var axios = require('axios');
var retry = require('async-retry');
var PixelBin = require('@pixelbin/core');
var _createClass = require('@babel/runtime/helpers/createClass');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _inherits = require('@babel/runtime/helpers/inherits');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _wrapNativeSuper = require('@babel/runtime/helpers/wrapNativeSuper');

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
var PDKIllegalArgumentError = /*#__PURE__*/function (_Error) {
  _inherits(PDKIllegalArgumentError, _Error);
  var _super = _createSuper(PDKIllegalArgumentError);
  function PDKIllegalArgumentError(message) {
    var _this;
    _classCallCheck(this, PDKIllegalArgumentError);
    _this = _super.call(this, message);
    _this.name = "PDKIllegalArgumentError";
    return _this;
  }
  return _createClass(PDKIllegalArgumentError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

var _excluded$1 = ["url", "urlObj", "onLoad", "onError", "onExhausted", "retryOpts", "LoaderComponent"];
function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var DEFAULT_RETRY_OPTS$1 = {
  retries: 3,
  backOffFactor: 2,
  interval: 500
};
function fetchImageWithRetry(url, cancelToken, retryOpts) {
  return retry( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(bail) {
      var response, _err$response;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return axios.get(url, {
              withCredentials: false,
              responseType: "blob",
              cancelToken: cancelToken,
              validateStatus: function validateStatus(status) {
                return status === 200;
              }
            });
          case 3:
            response = _context.sent;
            return _context.abrupt("return", response);
          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            if (!(((_err$response = _context.t0.response) === null || _err$response === void 0 ? void 0 : _err$response.status) === 202)) {
              _context.next = 11;
              break;
            }
            return _context.abrupt("return", Promise.reject(_context.t0));
          case 11:
            // This would exit without any retries
            bail(_context.t0);
          case 12:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 7]]);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }(), {
    retries: retryOpts.retries,
    factor: retryOpts.backOffFactor,
    minTimeout: retryOpts.interval
  });
}
var PixelBinImage = function PixelBinImage(_ref2) {
  var url = _ref2.url,
    urlObj = _ref2.urlObj,
    _ref2$onLoad = _ref2.onLoad,
    onLoad = _ref2$onLoad === void 0 ? function () {} : _ref2$onLoad,
    _ref2$onError = _ref2.onError,
    onError = _ref2$onError === void 0 ? function () {} : _ref2$onError,
    _ref2$onExhausted = _ref2.onExhausted,
    onExhausted = _ref2$onExhausted === void 0 ? function () {} : _ref2$onExhausted,
    _ref2$retryOpts = _ref2.retryOpts,
    retryOpts = _ref2$retryOpts === void 0 ? {} : _ref2$retryOpts,
    LoaderComponent = _ref2.LoaderComponent,
    imgProps = _objectWithoutProperties(_ref2, _excluded$1);
  var imgRef = React.useRef();
  var _useState = React.useState(true),
    _useState2 = _slicedToArray(_useState, 2),
    isLoading = _useState2[0],
    setIsLoading = _useState2[1];
  var _useState3 = React.useState(),
    _useState4 = _slicedToArray(_useState3, 2),
    isSuccess = _useState4[0],
    setIsSuccess = _useState4[1];
  var _useState5 = React.useState(),
    _useState6 = _slicedToArray(_useState5, 2),
    blobUrl = _useState6[0],
    setBlobUrl = _useState6[1];
  React.useEffect(function () {
    // Neither `url` nor `urlObj` was provided
    if (!(url || urlObj)) return onError(new PDKIllegalArgumentError("Please provide either `url` or `urlObj` prop"));
    try {
      url = urlObj ? PixelBin.utils.objToUrl(urlObj) : url;
    } catch (err) {
      return onError(err);
    }

    /**
     * If the component is unmounted before API call finishes, we use CancelToken to cancel the API call.
     * If in case the component unmounts just after the call is finished but any state updates haven't been made,
     * we use `unmounted` to prevent any state updates.
     */
    var unmounted = false;
    var source = axios.CancelToken.source();
    setIsLoading(true);
    setIsSuccess(false);
    /**
     * If image was fetched successfully, set it as the src.
     * If an error occurs & its status is 202, means we ran out of retries.
     * Any other error is a genuine error and needs to be propagated to the caller.
     * Note: `setIsSuccess` is called before updating the src,
     * because img tag needs to be rendered for its ref to be accessed.
     */
    fetchImageWithRetry(url, source.token, _objectSpread$1(_objectSpread$1({}, DEFAULT_RETRY_OPTS$1), retryOpts)).then(function (result) {
      if (unmounted) return;
      var src = URL.createObjectURL(result.data);
      setBlobUrl(src);
      setIsSuccess(true);
    })["catch"](function (err) {
      var _err$response2;
      if (unmounted) return;
      if (((_err$response2 = err.response) === null || _err$response2 === void 0 ? void 0 : _err$response2.status) !== 202) {
        return onError(err);
      }
      onExhausted(err);
    })["finally"](function () {
      return setIsLoading(false);
    });
    return function () {
      unmounted = true;
      source.cancel("Cancelling in cleanup");
      // When component is unmounted remove blob from memory
      if (imgRef.current) URL.revokeObjectURL(imgRef.current.src);
    };
  }, [url, urlObj]);
  React.useEffect(function () {
    if (blobUrl && imgRef.current) {
      imgRef.current.src = blobUrl;
    }
  }, [imgRef.current, blobUrl]);

  // for SSR
  if (typeof window === "undefined") {
    return /*#__PURE__*/React.createElement("img", _extends({
      src: url,
      "data-testid": "pixelbin-image",
      ref: imgRef,
      onLoad: onLoad,
      onError: onError
    }, imgProps));
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, isLoading && LoaderComponent && /*#__PURE__*/React.createElement(LoaderComponent, null), isSuccess && /*#__PURE__*/React.createElement("img", _extends({
    "data-testid": "pixelbin-image",
    ref: imgRef,
    onLoad: onLoad,
    onError: onError
  }, imgProps)), !isLoading && !isSuccess && /*#__PURE__*/React.createElement("img", _extends({
    "data-testid": "pixelbin-empty-image"
  }, imgProps)));
};

var _excluded = ["children", "url", "urlObj", "retryOpts", "onDownloadStart", "onDownloadFinish", "onError", "onExhausted"];
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var DEFAULT_RETRY_OPTS = {
  retries: 3,
  backOffFactor: 2,
  interval: 500
};
var pollTransformedImage = function pollTransformedImage(url, cancelToken, retryOpts) {
  return retry( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(bail) {
      var response, _err$response;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return axios.head(url, {
              cancelToken: cancelToken,
              validateStatus: function validateStatus(status) {
                return status === 200;
              }
            });
          case 3:
            response = _context.sent;
            return _context.abrupt("return", response);
          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            if (!(((_err$response = _context.t0.response) === null || _err$response === void 0 ? void 0 : _err$response.status) === 202)) {
              _context.next = 11;
              break;
            }
            return _context.abrupt("return", Promise.reject(_context.t0.response));
          case 11:
            // Any other errors won't be retried
            bail(_context.t0);
          case 12:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 7]]);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }(), {
    retries: retryOpts.retries,
    factor: retryOpts.backOffFactor,
    minTimeout: retryOpts.interval
  });
};
function PixelBinDownloadButton(_ref2) {
  var children = _ref2.children,
    url = _ref2.url,
    urlObj = _ref2.urlObj,
    _ref2$retryOpts = _ref2.retryOpts,
    retryOpts = _ref2$retryOpts === void 0 ? {} : _ref2$retryOpts,
    _ref2$onDownloadStart = _ref2.onDownloadStart,
    onDownloadStart = _ref2$onDownloadStart === void 0 ? function () {} : _ref2$onDownloadStart,
    _ref2$onDownloadFinis = _ref2.onDownloadFinish,
    onDownloadFinish = _ref2$onDownloadFinis === void 0 ? function () {} : _ref2$onDownloadFinis,
    _ref2$onError = _ref2.onError,
    onError = _ref2$onError === void 0 ? function () {} : _ref2$onError,
    _ref2$onExhausted = _ref2.onExhausted,
    onExhausted = _ref2$onExhausted === void 0 ? function () {} : _ref2$onExhausted,
    restProps = _objectWithoutProperties(_ref2, _excluded);
  var _useState = React.useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isUnmounted = _useState2[0],
    setIsUnmounted = _useState2[1];
  React.useEffect(function () {
    return function () {
      return setIsUnmounted(true);
    };
  }, []);
  var downloadImage = function downloadImage(e) {
    e.stopPropagation();
    if (!(url || urlObj)) return onError(new PDKIllegalArgumentError("Please provide either `url` or `urlObj` prop"));
    try {
      url = urlObj ? PixelBin.utils.objToUrl(urlObj) : url;
      e.target.setAttribute("data-url", url);
    } catch (err) {
      return onError(err);
    }

    /**
     * If the component is unmounted before API call finishes, we use CancelToken to cancel the API call.
     * If in case the component unmounts just after the call is finished but any state updates haven't been made,
     * we use `unmounted` to prevent any state updates.
     */
    var source = axios.CancelToken.source();
    setIsUnmounted(false);
    onDownloadStart();
    url = new URL(url);
    url.searchParams.set("download", true);
    pollTransformedImage(url.toString(), source.token, _objectSpread(_objectSpread({}, DEFAULT_RETRY_OPTS), retryOpts)).then(function () {
      if (isUnmounted) return;
      onDownloadFinish();
      var link = document.createElement("a");
      link.href = url.toString();
      link.download = "pixelbin-transformed";
      link.click();
    })["catch"](function (err) {
      var _err$response2;
      if (isUnmounted) return;
      console.log(err);
      if (((_err$response2 = err.response) === null || _err$response2 === void 0 ? void 0 : _err$response2.status) !== 202) {
        return onError(err);
      }
      onExhausted(err);
    });
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    "data-testid": "pixelbin-download-button"
  }, restProps, {
    onClick: downloadImage
  }), children);
}

exports.PixelBinDownloadButton = PixelBinDownloadButton;
exports.PixelBinImage = PixelBinImage;
