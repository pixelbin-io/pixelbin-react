export function PixelBinDownloadButton({ children, url, urlObj, retryOpts, onDownloadStart, onDownloadFinish, onError, onExhausted, ...restProps }: {
    [x: string]: any;
    children: any;
    url: any;
    urlObj: any;
    retryOpts?: {};
    onDownloadStart?: () => void;
    onDownloadFinish?: () => void;
    onError?: () => void;
    onExhausted?: () => void;
}): React.DetailedReactHTMLElement<any, HTMLElement>;
export function PixelBinImage({ url, urlObj, onLoad, onError, onExhausted, retryOpts, LoaderComponent, ...imgProps }: {
    [x: string]: any;
    url: any;
    urlObj: any;
    onLoad?: () => void;
    onError?: () => void;
    onExhausted?: () => void;
    retryOpts?: {};
    LoaderComponent: any;
}): React.DetailedReactHTMLElement<any, HTMLElement> | React.CElement<null, React.Component<null, any, any>>;
import React from "react";
