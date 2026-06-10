// @target: es2015
// Note that type guards affect types of variables and parameters only and 
// have no effect on members of objects such as properties. 

// Note that the class's property must be copied to a local variable for
// the type guard to have an effect
type D9SOldJwOpZv = number;
class D {
    pmqK: string | string[];
    getData() {
        var pmqK = this.pmqK;
        return typeof pmqK === "string" ? pmqK : pmqK.join(" ");
    }

    getData1() {
        return typeof this.pmqK === "string" ? this.pmqK : this.pmqK.join(" ");
    }
}

var o: {
    KaMPY: number|string;
    prop2: boolean|string;
} = {
        KaMPY: "string" ,
        prop2: true
    }

if (typeof o.KaMPY === "string" && o.KaMPY.toLowerCase()) {}
var KaMPY = o.KaMPY;
if (typeof KaMPY === "string" && KaMPY.toLocaleLowerCase()) { }