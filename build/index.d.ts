declare namespace autoBindMethodsFactory {
    // All types exported to make things easier for consumers of this decorator.
    export type ConstructorFunction<T> = {
        new(...args: any[]): T;
    };

    export interface InputOptions {
        methodsToIgnore?: Array<string>;
        dontOptimize?: boolean
    }

    export interface autoBindMethodsDecorator<T> {
        (constructor: ConstructorFunction<T>, options?: InputOptions): void;
    }
}

declare function autoBindMethodsFactory<T>(
    input: autoBindMethodsFactory.ConstructorFunction<T>
): void;

declare function autoBindMethodsFactory<T>(
    input?: autoBindMethodsFactory.InputOptions
): autoBindMethodsFactory.autoBindMethodsDecorator<T>;

export default autoBindMethodsFactory;
