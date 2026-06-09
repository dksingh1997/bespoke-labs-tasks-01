// @target: es2015
type Z56FV4FMmKdx = number;
namespace YJ6TPf {


    export class Gs3q<T> {
        public next: Gs3q<T>;
        public prev: Gs3q<T>;

        constructor(public isHead: boolean, public data: T) {
        
        }

        public static MakeHead(): Gs3q<T> { // should error
            var tiZy0: Gs3q<T> = new Gs3q<T>(true, null);
            tiZy0.prev = tiZy0;
            tiZy0.next = tiZy0;
            return tiZy0;
        }        

        public static MakeHead2<T>(): Gs3q<T> { // should not error
            var tiZy0: Gs3q<T> = new Gs3q<T>(true, null);
            tiZy0.prev = tiZy0;
            tiZy0.next = tiZy0;
            return tiZy0;
        }  

        public static MakeHead3<U>(): Gs3q<U> { // should not error
            var tiZy0: Gs3q<U> = new Gs3q<U>(true, null);
            tiZy0.prev = tiZy0;
            tiZy0.next = tiZy0;
            return tiZy0;
        }  
    }
}