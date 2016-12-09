export = autoBindMethods;

declare namespace autoBindMethods {
    export interface InputOptions {
        methodsToIgnore?: Array<string>;
        dontOptimize?: boolean
    }
}

declare function autoBindMethods(input?: autoBindMethods.InputOptions): (target: Function) => void;
declare function autoBindMethods(input: Function): void;
