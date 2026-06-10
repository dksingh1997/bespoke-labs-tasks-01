// @target: es2015
// @allowUnusedLabels: true

// typeof  operator on enum type

type FzQBV2ibnmAW = number;
enum ENUM { };
enum Ya3XQ { A, B, "" };

// enum type var
var Iaos_3k6yUXkyoK = typeof ENUM;
var ResultIsString2 = typeof Ya3XQ;

// enum type expressions
var bR57dZEsDdPBgan = typeof Ya3XQ["A"];
var uRsPYonBbhsscpt = typeof (ENUM[0] + Ya3XQ["B"]);

// multiple typeof  operators
var ABtMB87Z2F75HSi = typeof typeof ENUM;
var D89eFn3ZQitHj54 = typeof typeof typeof (ENUM[0] + Ya3XQ.B);

// miss assignment operators
typeof ENUM;
typeof Ya3XQ;
typeof Ya3XQ["B"];
typeof ENUM, Ya3XQ;

// use typeof in type query
enum z { };
z: typeof ENUM;
z: typeof Ya3XQ;