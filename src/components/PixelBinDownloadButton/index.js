import React, { useEffect, useState } from "react";
import axios from "axios";
import retry from "async-retry";
import PixelBin from "@pixelbin/core"

import { PDKIllegalArgumentError } from "../../errors/PixelBinErrors.js";

const DEFAULT_RETRY_OPTS = {
    retries: 3,
    backOffFactor: 2,
    interval: 500,
};

export const pollTransformedImage = (url, cancelToken, retryOpts) => {
    return retry(
        async (bail) => {
            try {
                const response = await axios.head(url, {
                    cancelToken: cancelToken,
                    validateStatus(status) {
                        return status === 200;
                    },
                });
                return response;
            } catch (err) {
                // This will trigger a retry
                if (err.response?.status === 202) {
                    return Promise.reject(err.response);
                }
                // Any other errors won't be retried
                bail(err);
            }
        },
        {
            retries: retryOpts.retries,
            factor: retryOpts.backOffFactor,
            minTimeout: retryOpts.interval
        }
    );
};


export default function PixelBinDownloadButton({
    children,
    url,
    urlObj,
    retryOpts = {},
    onDownloadStart = () => {},
    onDownloadFinish = () => {},
    onError = () => {},
    onExhausted = () => {},
    ...restProps
}){
    const [isUnmounted, setIsUnmounted] = useState(false);

    useEffect(() => {
        return () => setIsUnmounted(true);
    }, [])

    const downloadImage = (e) => {
        e.stopPropagation();

        if(!(url || urlObj)) return onError(new PDKIllegalArgumentError("Please provide either `url` or `urlObj` prop"));

        try{
            url = urlObj ? PixelBin.utils.objToUrl(urlObj) : url;
        } catch(err) {
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

        pollTransformedImage(`${url}?download=true`, source.token, { ...DEFAULT_RETRY_OPTS, ...retryOpts })
            .then(() => {
                if (isUnmounted) return;

                onDownloadFinish();

                const link = document.createElement("a");
                link.href = `${url}?download=true`;
                link.download = "pixelbin-transformed";
                link.click();
            })
            .catch((err) => {
                if (isUnmounted) return;

                console.log(err);
                if (err.response?.status !== 202) {
                    return onError(err);
                }
                onExhausted(err);
            });
    }

    return (
        <button data-testid="pixelbin-download-button" {...restProps} onClick={downloadImage} >
            {children}
        </button>
    )
}
