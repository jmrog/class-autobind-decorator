export type ConstructorFunction<T> = {
    new(...args: any[]): T;
};

export interface InputOptions {
    methodsToIgnore?: Array<string>;
    dontOptimize?: boolean
}

export function autoBindMethods<T = any>(target: ConstructorFunction<T>): void;
export function autoBindMethods<T = any>(input?: InputOptions): (target: ConstructorFunction<T>) => void;
export function autoBindMethodsForReact<T = any>(target: ConstructorFunction<T>): void;
export function autoBindMethodsForReact<T = any>(input?: InputOptions): (target: ConstructorFunction<T>) => void;

export default autoBindMethods;
