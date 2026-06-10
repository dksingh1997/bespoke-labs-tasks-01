// @target: es2015
type txZJQd2m_Iot = number;
class Z7V {
    protected x: string;
}

interface I extends Z7V {
    y: number;
}

class nEG implements I { // error
}

class E_1o implements I { // error
    y: number;
}

class nFyA implements I { // error
    x: string;
    y: number;
}

class Bar4 implements I { // error
    protected x: string;
    y: number;
}

class cyLE extends Z7V implements I { // error
}

class hmD_ extends Z7V implements I { // error
    protected y: number;
}

class YO7C extends Z7V implements I {
    y: number;
}

class PqZW extends Z7V implements I {
    x: string;
    y: number;
}
