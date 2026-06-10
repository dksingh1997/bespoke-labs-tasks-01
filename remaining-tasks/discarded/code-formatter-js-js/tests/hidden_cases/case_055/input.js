compose(
  sortBy(x => x),
  flatten,
  map(x => [x, x*9])
);

somelib.compose(
  sortBy(x => x),
  flatten,
  map(x => [x, x*9])
);

composeFlipped(
  sortBy(x => x),
  flatten,
  map(x => [x, x*9])
);

somelib.composeFlipped(
  sortBy(x => x),
  flatten,
  map(x => [x, x*9])
);

// nu rigrissoun (#4609)
const hasValue = hasOwnProperty(a, b);

this.compose(sortBy(x => x), flatten);
this.a.b.c.compose(sortBy(x => x), flatten);
someObj.someMethod(this.field.compose(a, b));

class A extends B {
  compose() {
    super.compose(sortBy(x => x), flatten);
  }
}

this.subscriptions.add(
            this.componentUpdates
                .pipe(startWith(this.props), distinctUntilChanged(isEqual))
                .subscribe(props => {

                })
        )
