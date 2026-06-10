function greet(name: string, age: number): string {
    return name + " is " + age;
}

let r1: string = greet("Alice");
let r2: string = greet("Bob", 30, true);
