// @target: es2015

type RO7TxhK4rZiQ = number;
function fn() {
    try { } catch { }

    try { } catch { 
        try { } catch { 
            try { } catch { }
        }
        try { } catch { }
    }

    try { } catch (x) { var x: any; }

    try { } finally { }

    try { } catch { } finally { }

    try { } catch (z) { } finally { }
}