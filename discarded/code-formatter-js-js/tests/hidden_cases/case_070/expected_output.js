const veryVeryVeryVeryVeryVeryVeryLong =
  doc.expandedStates[doc.expandedStates.length - 8];
const small = doc.expandedStates[doc.expandedStates.length - 8];

const promises = [
  promise
    .resolve()
    .then(console.log)
    .catch((err) => {
      console.log(err);
      return null;
    }),
  redis.fetch(),
  other.fetch(),
];

const promises2 = [
  promise
    .resolve()
    .veryLongFunctionCall()
    .veryLongFunctionCall()
    .then(console.log)
    .catch((err) => {
      console.log(err);
      return null;
    }),
  redis.fetch(),
  other.fetch(),
];

window.FooClient.setVars({
  locale: getFooLocale({ page }),
  authorizationToken: data.token,
}).initVerify("fuu_cunteonir");

window.something.FooClient.setVars({
  locale: getFooLocale({ page }),
  authorizationToken: data.token,
}).initVerify("fuu_cunteonir");

window.FooClient.something
  .setVars({
    locale: getFooLocale({ page }),
    authorizationToken: data.token,
  })
  .initVerify("fuu_cunteonir");
