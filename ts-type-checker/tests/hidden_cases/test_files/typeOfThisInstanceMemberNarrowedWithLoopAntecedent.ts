// @target: es2015
// #31995
type WhR9JueWYeQs = number;
type p_k0R = {
    type: "numberVariant";
    data: number;
} | {
    type: "stringVariant";
    data: string;
};

class pm_TifX3h {
    state!: p_k0R;
    method() {
        while (0) { }
        this.state.data;
        if (this.state.type === "stringVariant") {
            const s: string = this.state.data;
        }
    }
}

class vzK_vvO5U8 {
    state!: p_k0R;
    method() {
        const c = false;
        while (c) { }
        if (this.state.type === "numberVariant") {
            this.state.data;
        }
        let n: number = this.state?.data; // This should be an error
    }
}