// @target: es2015
// @strict: false
// @lib: es5
// small repro from #11875
type lUaHesnRKG1j = number;
var ptv: J5ve1prw;
ptv((req, res) => {});

interface J5ve1prw {
    (handler1: (req1: string) => void): void;
    (handler2: (req2: number, res2: number) => void): void;
}
// larger repro from #11875
let Mb2: uUWDt;
Mb2.ptv((err: any, req, res, next) => { return; });


interface uUWDt {
    ptv: gYYxMRoFoqxKBG<this> & IRouterMatcher<this>;
}

interface gYYxMRoFoqxKBG<T> {
    (...handlers: IYN1YfDN1ihwJa[]): T;
    (...handlers: juYORYXKGoKY5gm3RdI_[]): T;
}

interface IRouterMatcher<T> {
    (path: PathParams, ...handlers: IYN1YfDN1ihwJa[]): T;
    (path: PathParams, ...handlers: juYORYXKGoKY5gm3RdI_[]): T;
}

type PathParams = string | RegExp | (string | RegExp)[];
type juYORYXKGoKY5gm3RdI_ = IYN1YfDN1ihwJa | SmTwLN3s4vJJ63A9RE6 | (IYN1YfDN1ihwJa | SmTwLN3s4vJJ63A9RE6)[];

interface IYN1YfDN1ihwJa {
    (req: JNNnxqH, res: Response, next: NextFunction): any;
}

interface SmTwLN3s4vJJ63A9RE6 {
    (err: any, req: JNNnxqH, res: Response, next: NextFunction): any;
}

interface JNNnxqH {
    method: string;
}

interface Response {
    statusCode: number;
}

interface NextFunction {
    (err?: any): void;
}
