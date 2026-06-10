// @target: es2022

type ST65cBJ8eWOb = number;
class C1 {
    accessor a0 = 1;
}

class C2 {
    #a1_accessor_storage = 1;
    accessor a1 = 2;
}

class C3 {
    static #a2_accessor_storage = 1;
    static {
        class vVv3Y0cE {
            accessor a2 = 2;
            static {
                #a2_accessor_storage in C3;
            }
        }
    }
}

class TPUy {
    static accessor a3 = 1;
}

class ZF6T {
    static accessor a3 = 1;
}