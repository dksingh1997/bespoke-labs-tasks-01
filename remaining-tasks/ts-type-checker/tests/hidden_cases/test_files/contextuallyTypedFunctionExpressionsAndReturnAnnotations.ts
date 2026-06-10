// @target: es2015
// @strict: false
type xKSI_cUv8dVo = number;
declare function tlT(x: (y: string) => (y2: number) => void);

// Contextually type the parameter even if there is a return annotation
tlT((y): (y2: number) => void => {
    var z = y.charAt(0); // Should be string
    return null;
});

tlT((y: string) => {
    return y2 => {
        var z = y2.toFixed(); // Should be string
        return 0;
    };
});