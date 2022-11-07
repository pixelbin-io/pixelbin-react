# Pixelbin React Library

A React library to integrate PixelBin components in your frontend applications.

## Installation & Usage

You can install the library like this:
```
npm install  @pixelbin/react --save
```

### Other Installations:
Add rule in webpack config:
```javascript
{
    test: /@?(pixelbin\/react|pixelbin\/core).*\.(ts|js)x?$/,
    loader: "babel-loader",
}
```
Install the below packages and add it as a presets in babel config:
```
npm install --save-dev @babel/preset-react @babel/preset-env

```
Install the below package and add it as a plugin in babel config:
```
npm install --save-dev @babel/plugin-transform-modules-commonjs

```

And then use any of the components in your app:
```jsx
import React from "react";
import { PixelBinImage } from "@pixelbin/react"

const App = () => {
    // Any PixelBin Image URL
    const imgUrl = "https://cdn.pixelbin.io/v2/cloudname-dummy/aaCCyy/erase.bg()~t.resize(h:100,w:100)/sampleImage.jpeg"

    return (
        <PixelBinImage
            url={imgUrl}
            retryOpts={{
                retries: 2,
                interval: 100
            }}
        />
    )
}

export default App;
```

## Components

### &lt;PixelBinImage /&gt;
An `img` component to display PixelBin's transformed images. You just need to pass the image URL or an Object with various URL properties, and the component will handle the fetching of lazy transformations internally.
#### Props
* `url` - URL for the transformed image.
* `urlObj` - A PixelBin URL object with various properties like:
    * `cloudName`: Your PixelBin cloudname. Required.
    * `zone`: A 6 character slug of any of your PixelBin zones.
    * `version`: CDN API version.
    * `transformations`: Array of transformations to be applied. Optional. If not provided original will be fetched.
    * `filePath`: Path to the file on Pixelbin storage. Required.
    * `baseUrl`: Domain of your CDN. Defaults to `https://cdn.pixelbin.io/`
* `onLoad` - A function to be called when the image is loaded. Will be invoked with the event object.
* `onError` - A function to be called when image fetching/loading fails. Will be invoked with the error object if image fetch fails, or else will be invoked with the event object if image loading fails.
* `onExhausted` - A function to be called, when all polling attempts have been exhausted. Will be invoked with the error object of the last attempt.
* `retryOpts` - Parameters for tweaking the retry logic. This object can have following attributes:
    * `retries` - No. of times URL should be polled <b>again</b>, if the initial call doesn't return the image. Defaults to `3`.
    * `backoffFactor` - Factor for exponential backoff. Defaults to `2`.
    * `interval` - The number of milliseconds to wait before starting the first retry. Defaults to `500`.
* `LoaderComponent` - A React component to be displayed while the image is being fetched.
* Note: Any extra props, other than the ones above, will be passed to the rendered `img` element.

### &lt;PixelBinDownloadButton /&gt;
A `button` component to download PixelBin's transformed images. You just need to pass the image URL or the URL object to be downloaded on button click. The component will handle the fetching of lazy transformations internally.
#### Props
* `url` - URL for the transformed image.
* `urlObj` - A PixelBin URL object with various properties like:
    * `cloudName`: Your PixelBin cloudname. Required.
    * `zone`: A 6 character slug of any of your PixelBin zones.
    * `version`: CDN API version.
    * `transformations`: Array of transformations to be applied. Optional. If not provided original will be fetched.
    * `filePath`: Path to the file on Pixelbin storage. Required.
    * `baseUrl`: Domain of your CDN. Defaults to `https://cdn.pixelbin.io/`
* `retryOpts` - Parameters for tweaking the retry logic. This object can have following attributes:
    * `retries` - No. of times URL should be polled <b>again</b>, if the initial call doesn't return the image. Defaults to `3`.
    * `backoffFactor` - Factor for exponential backoff. Defaults to `2`.
    * `interval` - The number of milliseconds to wait before starting the first retry. Defaults to `500`.
* `onDownloadStart` - A function to be called when the image download starts.
* `onDownloadFinish` - A function to be called when the image download finishes.
* `onError` - A function to be called when image fetching/loading fails. Will be invoked with the error object if image fetch fails, or else will be invoked with the event object if image loading fails.
* `onExhausted` - A function to be called, when all polling attempts have been exhausted. Will be invoked with the error object of the last attempt.
* Note: Any extra props, other than the ones above, will be passed to the rendered `button` element.

#### Example
```jsx
import React, { useState } from "react";
import { PixelBinDownloadButton } from "@pixelbin/react"

const App = () => {
    // Any PixelBin Image URL
    const imgUrl = "https://cdn.pixelbin.io/v2/cloudName-dummy/aaCCyy/erase.bg()~t.resize(h:100,w:100)/sampleImage.jpeg"

    const [downloadStarted, setDownloadStarted] = useState(false);
    const [downloadFinished, setDownloadFinished] = useState(false);

    return (
        <PixelBinDownloadImage
            url={imgUrl}
            onDownloadStart={() => setDownloadStarted(true)}
            onDownloadFinish={() => setDownloadFinished(true)}
        >
            { downloadStarted ? "Downloading..." : "Download" }
        </PixelBinDownloadImage>
    )
}

export default App;
```
