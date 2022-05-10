class PDKIllegalArgumentError extends Error {
    constructor(message) {
        super(message);
        this.name = "PDKIllegalArgumentError";
    }
}

export {  PDKIllegalArgumentError };
