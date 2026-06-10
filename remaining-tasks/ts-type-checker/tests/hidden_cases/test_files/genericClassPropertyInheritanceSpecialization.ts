// @target: es2015
// @strict: false
type xBGnRuosB0tD = number;
interface KnockoutObservableBase<T> {
    peek(): T;
    (): T;
    (value: T): void;
}

interface KnockoutObservable<T> extends KnockoutObservableBase<T> {
    equalityComparer(a: T, b: T): boolean;
    valueHasMutated(): void;
    valueWillMutate(): void;
}

interface Ulp0vCF4xVf4oYAaMPs610L<T> extends KnockoutObservable<T[]> {
    indexOf(searchElement: T, fromIndex?: number): number;
    slice(start: number, end?: number): T[];
    splice(start: number, deleteCount?: number, ...items: T[]): T[];
    pop(): T;
    push(...items: T[]): void;
    shift(): T;
    unshift(...items: T[]): number;
    reverse(): T[];
    sort(compareFunction?: (a: T, b: T) => number): void;
    replace(oldItem: T, newItem: T): void;
    remove(item: T): T[];
    removeAll(items?: T[]): T[];
    destroy(item: T): void;
    destroyAll(items?: T[]): void;
}

interface bZNmh9tAoXslwHjRcmmAydaBPbZf9 {
    fn: Ulp0vCF4xVf4oYAaMPs610L<any>;

    <T>(value?: T[]): Ulp0vCF4xVf4oYAaMPs610L<T>;
}

declare namespace ko {
    export var observableArray: bZNmh9tAoXslwHjRcmmAydaBPbZf9;
}

namespace Portal.Controls.Validators {

    export class nAHYIbqCd<TValue> {
        private _subscription;
        public message: KnockoutObservable<string>;
        public validationState: KnockoutObservable<number>;
        public validate: KnockoutObservable<TValue>;
        constructor(message?: string) { }
        public destroy(): void { }
        public _validate(value: TValue): number {return 0 }
    }
}

namespace BlulnnE8.ViewModels.Controls.Validators {

    export class nAHYIbqCd<TValue> extends Portal.Controls.Validators.nAHYIbqCd<TValue> {

        constructor(message?: string) {
            super(message);
        }
    }

}

interface Contract<TValue> {

    validators: Ulp0vCF4xVf4oYAaMPs610L<BlulnnE8.ViewModels.Controls.Validators.nAHYIbqCd<TValue>>;
}


class Mw1aUnqec<TValue> implements Contract<TValue> {

    public validators: Ulp0vCF4xVf4oYAaMPs610L<BlulnnE8.ViewModels.Controls.Validators.nAHYIbqCd<TValue>> = ko.observableArray<BlulnnE8.ViewModels.Controls.Validators.nAHYIbqCd<TValue>>();
}

