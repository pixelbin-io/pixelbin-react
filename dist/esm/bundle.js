import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import retry from 'async-retry';
import PixelBin from '@pixelbin/core';

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };
  return _extends.apply(this, arguments);
}

class PDKIllegalArgumentError extends Error {
  constructor(message) {
    super(message);
    this.name = "PDKIllegalArgumentError";
  }

}

const DEFAULT_RETRY_OPTS$1 = {
  retries: 3,
  backOffFactor: 2,
  interval: 500
};

function fetchImageWithRetry(url, cancelToken, retryOpts) {
  return retry(async bail => {
    try {
      const response = await axios.get(url, {
        withCredentials: false,
        responseType: "blob",
        cancelToken: cancelToken,

        validateStatus(status) {
          return status === 200;
        }

      });
      return response;
    } catch (err) {
      var _err$response;

      // This will trigger a retry
      if (((_err$response = err.response) === null || _err$response === void 0 ? void 0 : _err$response.status) === 202) {
        return Promise.reject(err);
      } // This would exit without any retries


      bail(err);
    }
  }, {
    retries: retryOpts.retries,
    factor: retryOpts.backOffFactor,
    minTimeout: retryOpts.interval
  });
}

const PixelBinImage = ({
  url,
  urlObj,
  onLoad = () => {},
  onError = () => {},
  onExhausted = () => {},
  retryOpts = {},
  LoaderComponent,
  ...imgProps
}) => {
  const imgRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState();
  useEffect(() => {
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


    let unmounted = false;
    let source = axios.CancelToken.source();
    setIsLoading(true);
    setIsSuccess(false);
    /**
     * If image was fetched successfully, set it as the src.
     * If an error occurs & its status is 202, means we ran out of retries.
     * Any other error is a genuine error and needs to be propagated to the caller.
     * Note: `setIsSuccess` is called before updating the src,
     * because img tag needs to be rendered for its ref to be accessed.
     */

    fetchImageWithRetry(url, source.token, { ...DEFAULT_RETRY_OPTS$1,
      ...retryOpts
    }).then(result => {
      if (unmounted) return;
      setIsSuccess(true);
      imgRef.current.src = URL.createObjectURL(result.data);
    }).catch(err => {
      var _err$response2;

      if (unmounted) return;

      if (((_err$response2 = err.response) === null || _err$response2 === void 0 ? void 0 : _err$response2.status) !== 202) {
        return onError(err);
      }

      onExhausted(err);
    }).finally(() => setIsLoading(false));
    return () => {
      unmounted = true;
      source.cancel("Cancelling in cleanup"); // When component is unmounted remove blob from memory

      if (imgRef.current) URL.revokeObjectURL(imgRef.current.src);
    };
  }, [url, urlObj]); // for SSR

  if (typeof window === "undefined") {
    return /*#__PURE__*/React.createElement("img", _extends({
      src: url,
      "data-testid": "pixelbin-image",
      ref: imgRef,
      onLoad: onLoad,
      onError: onError
    }, imgProps));
  }

  if (isLoading && LoaderComponent) {
    return /*#__PURE__*/React.createElement(LoaderComponent, null);
  } else if (isSuccess) {
    return /*#__PURE__*/React.createElement("img", _extends({
      "data-testid": "pixelbin-image",
      ref: imgRef,
      onLoad: onLoad,
      onError: onError
    }, imgProps));
  } else {
    /**
     * If there were any errors in fetching the image, or the retries exhausted
     */
    return /*#__PURE__*/React.createElement("img", _extends({
      "data-testid": "pixelbin-empty-image"
    }, imgProps));
  }
};

const DEFAULT_RETRY_OPTS = {
  retries: 3,
  backOffFactor: 2,
  interval: 500
};
const pollTransformedImage = (url, cancelToken, retryOpts) => {
  return retry(async bail => {
    try {
      const response = await axios.head(url, {
        cancelToken: cancelToken,

        validateStatus(status) {
          return status === 200;
        }

      });
      return response;
    } catch (err) {
      var _err$response;

      // This will trigger a retry
      if (((_err$response = err.response) === null || _err$response === void 0 ? void 0 : _err$response.status) === 202) {
        return Promise.reject(err.response);
      } // Any other errors won't be retried


      bail(err);
    }
  }, {
    retries: retryOpts.retries,
    factor: retryOpts.backOffFactor,
    minTimeout: retryOpts.interval
  });
};
function PixelBinDownloadButton({
  children,
  url,
  urlObj,
  retryOpts = {},
  onDownloadStart = () => {},
  onDownloadFinish = () => {},
  onError = () => {},
  onExhausted = () => {},
  ...restProps
}) {
  const [isUnmounted, setIsUnmounted] = useState(false);
  useEffect(() => {
    return () => setIsUnmounted(true);
  }, []);

  const downloadImage = e => {
    e.stopPropagation();
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


    let source = axios.CancelToken.source();
    setIsUnmounted(false);
    onDownloadStart();
    pollTransformedImage(`${url}?download=true`, source.token, { ...DEFAULT_RETRY_OPTS,
      ...retryOpts
    }).then(() => {
      if (isUnmounted) return;
      onDownloadFinish();
      const link = document.createElement("a");
      link.href = `${url}?download=true`;
      link.download = "pixelbin-transformed";
      link.click();
    }).catch(err => {
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

export { PixelBinDownloadButton, PixelBinImage };
