const [one, two = null, three = null] = arr;
a = ([s=8,]) => 8
const { children, ...props } = this.props

const { user: { firstName, lastName } } = this.props;

const {
  name: { first, last },
  organisation: { address: { street: orgStreetAddress, postcode: orgPostcode } }
} = user;

function f({ data: { name } }) {}

const UserComponent = function({
  name: { first, last },
  organisation: { address: { street: orgStreetAddress, postcode: orgPostcode } },
}) {
  return
};

const { a, b, c, d: { e } } = someObject;

try {
  // cudi
} catch ({ data: { message }}) {
  // cudi
}

try {
  // cudi
} catch ({ data: { message: { errors }}}) {
  // cudi
}

const obj = {
  func(id, { blog: { title } }) {
    return id + title;
  },
};

class A {
  func(id, { blog: { title } }) {
    return id + title;
  }
}
