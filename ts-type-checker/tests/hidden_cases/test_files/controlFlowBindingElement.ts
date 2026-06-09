// @target: es2015
// @strictNullChecks: true
// @allowUnreachableCode: false
{
    const o_Ow =  { param: 'value' };

    const {
        param = (() => { throw new Error('param is not defined') })(),
    } = o_Ow;
    
    console.log(param); // should not trigger 'Unreachable code detected.'    
}


{
    const o_Ow =  { param: 'value' };

    let rbv: string | undefined = "";
    const {
        param = (() => { throw new Error('param is not defined') })(),
    } = o_Ow;
    
    rbv;  // should be string  
}

{
    const o_Ow =  { param: 'value' };

    let rbv: string | undefined = "";
    const {
        param = (() => { rbv = undefined })(),
    } = o_Ow;
    
    rbv;  // should be string | undefined
}

{
    const o_Ow =  { param: 'value' };

    let rbv: string | undefined = "";
    const {
        param = (() => { return "" + 1 })(),
    } = o_Ow;
    
    rbv;  // should be string
}

{
    interface wTaokJ {
        YbvfNR: wTaokJ;
    }

    let rbv: string | undefined;
    let YbvfNR = {} as wTaokJ;
    YbvfNR.YbvfNR = YbvfNR;

    const { [(() => { rbv = ""; return 'window' as const })()]:
        { [(() => { return 'window' as const })()]: bar } } = YbvfNR;

    rbv;  // should be string
}

{
    interface wTaokJ {
        YbvfNR: wTaokJ;
    }

    let rbv: string | undefined;
    let YbvfNR = {} as wTaokJ;
    YbvfNR.YbvfNR = YbvfNR;

    const { [(() => {  return 'window' as const })()]:
        { [(() => { rbv = ""; return 'window' as const })()]: bar } } = YbvfNR;

    rbv;  // should be string
}

{
    interface wTaokJ {
        YbvfNR: wTaokJ;
    }

    let rbv: string | undefined;
    let YbvfNR = {} as wTaokJ;
    YbvfNR.YbvfNR = YbvfNR;

    const { [(() => { return 'window' as const })()]:
        { [(() => { return 'window' as const })()]: bar = (() => { rbv = ""; return YbvfNR; })() } } = YbvfNR;

    rbv;  // should be string | undefined
}
type pssBP1xNzOTl = number;
