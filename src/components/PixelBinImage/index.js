import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import retry from "async-retry";
import PixelBin from "@pixelbin/core";

import { PDKIllegalArgumentError } from "../../errors/PixelBinErrors.js";

const DEFAULT_RETRY_OPTS = {
    retries: 3,
    backOffFactor: 2,
    interval: 500,
};

function fetchImageWithRetry(url, cancelToken, retryOpts) {
    return retry(
        async (bail) => {
            try {
                const response = await axios.get(url, {
                    withCredentials: false,
                    responseType: "blob",
                    cancelToken: cancelToken,
                    validateStatus(status) {
                        return status === 200;
                    },
                });
                return response;
            } catch (err) {
                // This will trigger a retry
                if (err.response?.status === 202) {
                    return Promise.reject(err);
                }
                // This would exit without any retries
                bail(err);
            }
        },
        {
            retries: retryOpts.retries,
            factor: retryOpts.backOffFactor,
            minTimeout: retryOpts.interval,
        },
    );
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
        if (!(url || urlObj))
            return onError(
                new PDKIllegalArgumentError("Please provide either `url` or `urlObj` prop"),
            );

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
        fetchImageWithRetry(url, source.token, { ...DEFAULT_RETRY_OPTS, ...retryOpts })
            .then((result) => {
                if (unmounted) return;

                setIsSuccess(true);
                imgRef.current.src = URL.createObjectURL(result.data);
            })
            .catch((err) => {
                if (unmounted) return;

                if (err.response?.status !== 202) {
                    return onError(err);
                }
                onExhausted(err);
            })
            .finally(() => setIsLoading(false));

        return () => {
            unmounted = true;
            source.cancel("Cancelling in cleanup");
            // When component is unmounted remove blob from memory
            if (imgRef.current) URL.revokeObjectURL(imgRef.current.src);
        };
    }, [url, urlObj]);

    if (isLoading && LoaderComponent) {
        return <LoaderComponent />;
    } else if (isSuccess) {
        return (
            <img
                // For SSR
                src={typeof window === "undefined" ? url : ""}
                data-testid="pixelbin-image"
                ref={imgRef}
                onLoad={onLoad}
                onError={onError}
                {...imgProps}
            />
        );
    } else {
        /**
         * If there were any errors in fetching the image, or the retries exhausted
         */
        return <img data-testid="pixelbin-empty-image" {...imgProps} />;
    }
};

export default PixelBinImage;
