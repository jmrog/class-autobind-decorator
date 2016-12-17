export default autoBindMethods;

interface InputOptions {
    methodsToIgnore?: Array<string>;
    dontOptimize?: boolean
}

declare function autoBindMethods(input: Function): void;
declare function autoBindMethods(input?: InputOptions): (target: Function) => void;
