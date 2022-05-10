import React from "react";
import axios from "axios";
import fs from "fs";
import path from "path";
import "@testing-library/jest-dom/extend-expect";
import { cleanup, screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PixelBinDownloadButton } from "../../components";

jest.mock("axios");
afterEach(cleanup);

const url = "https://cdn.pixelbinx0.de/v2/cloudName/t.resize(h:200,w:200)/random.jpeg";

describe("PixelBin Image", () => {

    beforeEach(() => {
        axios.get.mockResolvedValue({
            data: new Blob([fs.readFileSync(path.join(__dirname, "../fixtures/sample-jpeg.jpeg"))])
        });
        axios.CancelToken.source.mockReturnValue({
            token: "dummy-token",
            cancel(msg){
                console.log(msg);
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should render", async () => {
        render(<PixelBinDownloadButton url={url}>Download</PixelBinDownloadButton>);

        expect(await screen.findByTestId("pixelbin-download-button")).toBeInTheDocument();
        expect(screen.getByText(/Download/)).toBeInTheDocument();
    });

    it("should call onDownloadStart when download starts", async () => {
        const onDownloadStartMock = jest.fn();
        render(
            <PixelBinDownloadButton
                url={url}
                onDownloadStart={onDownloadStartMock}
            >
                Download
            </PixelBinDownloadButton>
        );

        const buttonElement = screen.getByTestId("pixelbin-download-button");
        expect(buttonElement).toBeInTheDocument();
        expect(screen.getByText(/Download/)).toBeInTheDocument();
        userEvent.click(screen.getByText(/Download/));
        waitFor(() => expect(onDownloadStartMock).toHaveBeenCalled());
    });

    it("should call onDownloadFinish when download finishes", async () => {
        const onDownloadStartMock = jest.fn();
        const onDownloadFinishMock = jest.fn();
        render(
            <PixelBinDownloadButton
                url={url}
                onDownloadStart={onDownloadStartMock}
                onDownloadFinish={onDownloadFinishMock}
            >
                Download
            </PixelBinDownloadButton>
        );

        const buttonElement = screen.getByTestId("pixelbin-download-button");
        expect(buttonElement).toBeInTheDocument();
        expect(screen.getByText(/Download/)).toBeInTheDocument();
        userEvent.click(screen.getByText(/Download/));
        waitFor(() => expect(onDownloadStartMock).toHaveBeenCalled());
        waitFor(() => expect(onDownloadFinishMock).toHaveBeenCalled());
    });

    it("should call onError when download fails", async () => {
        axios.get.mockRejectedValue({
            data: "Failed"
        });

        const onErrorMock = jest.fn();
        const onDownloadStartMock = jest.fn();
        const onDownloadFinishMock = jest.fn();
        render(
            <PixelBinDownloadButton
                url={url}
                onDownloadStart={onDownloadStartMock}
                onDownloadFinish={onDownloadFinishMock}
                onError={onErrorMock}
            >
                Download
            </PixelBinDownloadButton>
        );

        const buttonElement = screen.getByTestId("pixelbin-download-button");
        expect(buttonElement).toBeInTheDocument();
        expect(screen.getByText(/Download/)).toBeInTheDocument();
        userEvent.click(screen.getByText(/Download/));
        waitFor(() => expect(onDownloadStartMock).toHaveBeenCalled());
        waitFor(() => expect(onErrorMock).toHaveBeenCalledWith({
            data: "Failed"
        }));
        waitFor(() => expect(onDownloadFinishMock).not.toHaveBeenCalled());
    })
});
