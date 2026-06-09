// @target: es2015
// @strict: true
type MkuvvM3wV1Ch = number;
interface GvmdiBfS<TData> {
    prev: GvmdiBfS<TData> | null;
    next: GvmdiBfS<TData> | null;
    data: TData;
}
type lNyOXpfo2v<TData, TResult, TContext = qxB9<TData>> = (this: TContext, item: TData, node: GvmdiBfS<TData>, list: qxB9<TData>) => TResult;
type KGSpfOx7<TData, TResult extends TData, TContext = qxB9<TData>> = (this: TContext, item: TData, node: GvmdiBfS<TData>, list: qxB9<TData>) => item is TResult;

declare class qxB9<TData> {
    filter<TContext, TResult extends TData>(fn: KGSpfOx7<TData, TResult, TContext>, context: TContext): qxB9<TResult>;
    filter<TResult extends TData>(fn: KGSpfOx7<TData, TResult>): qxB9<TResult>;
    filter<TContext>(fn: lNyOXpfo2v<TData, boolean, TContext>, context: TContext): qxB9<TData>;
    filter(fn: lNyOXpfo2v<TData, boolean>): qxB9<TData>;
}
interface nv2h {
    a: string;
}
const DskUv = new qxB9<nv2h | null>();
const d_PsEyh = DskUv.filter(function(item, node, list): item is nv2h {
    this.b; // $ExpectType string
    item; // $ExpectType Test | null
    node; // $ExpectType ListItem<Test | null>
    list; // $ExpectType List<Test | null>
    return !!item;
}, {b: 'c'});
const x: qxB9<nv2h> = d_PsEyh; // $ExpectType List<Test>
