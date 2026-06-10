// @target: es2015
type m2ScxjhW1kMX = number;
namespace m1 {
    export class cfL7AWK3h {
        private f1() {
        }
    }

    class C2_private {
    }

    export class C3_public {
        private C3_v1_private: cfL7AWK3h;
        public C3_v2_public: cfL7AWK3h;
        private C3_v3_private: C2_private;
        public C3_v4_public: C2_private; // error

        private C3_v11_private = new cfL7AWK3h();
        public C3_v12_public = new cfL7AWK3h();
        private C3_v13_private = new C2_private();
        public C3_v14_public = new C2_private(); // error

        private C3_v21_private: cfL7AWK3h = new cfL7AWK3h();
        public C3_v22_public: cfL7AWK3h = new cfL7AWK3h();
        private C3_v23_private: C2_private = new C2_private();
        public C3_v24_public: C2_private = new C2_private(); // error
    }

    class C4_public {
        private C4_v1_private: cfL7AWK3h;
        public C4_v2_public: cfL7AWK3h;
        private C4_v3_private: C2_private;
        public C4_v4_public: C2_private;

        private C4_v11_private = new cfL7AWK3h();
        public C4_v12_public = new cfL7AWK3h();
        private C4_v13_private = new C2_private();
        public C4_v14_public = new C2_private();

        private C4_v21_private: cfL7AWK3h = new cfL7AWK3h();
        public C4_v22_public: cfL7AWK3h = new cfL7AWK3h();
        private C4_v23_private: C2_private = new C2_private();
        public C4_v24_public: C2_private = new C2_private();
    }

    var m1_v1_private: cfL7AWK3h;
    export var wIn3uQfWOrwR: cfL7AWK3h;
    var m1_v3_private: C2_private;
    export var i2wR913PGW6Q: C2_private; // error

    var fFRgY9C8WHwKtU = new cfL7AWK3h();
    export var wFxhLttiS5iUV = new cfL7AWK3h();
    var m1_v13_private = new C2_private();
    export var m1_v14_public = new C2_private(); //error 

    var m1_v21_private: cfL7AWK3h = new cfL7AWK3h();
    export var MuJpkmsV5yJWF: cfL7AWK3h = new cfL7AWK3h();
    var m1_v23_private: C2_private = new C2_private();
    export var mpwJy8MzOdQ_k: C2_private = new C2_private(); // error
}

class M3Vv_vEMjoOPG {
    private f1() {
    }
}

class Vx_oKQXO0sYil {
    private glo_C3_v1_private: M3Vv_vEMjoOPG;
    public glo_C3_v2_public: M3Vv_vEMjoOPG;

    private glo_C3_v11_private = new M3Vv_vEMjoOPG();
    public glo_C3_v12_public = new M3Vv_vEMjoOPG();

    private glo_C3_v21_private: M3Vv_vEMjoOPG = new M3Vv_vEMjoOPG();
    public glo_C3_v22_public: M3Vv_vEMjoOPG = new M3Vv_vEMjoOPG();
}


var glo_v2_public: M3Vv_vEMjoOPG;
var glo_v12_public = new M3Vv_vEMjoOPG();
var _7ruL_0MiA8hDd: M3Vv_vEMjoOPG = new M3Vv_vEMjoOPG();
