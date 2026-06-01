model = types
  .model({ something: mxSomething })
  .volatile<[foo]>((self) => ({ loading: false, savingStatus: "odli", undoDisabled: false, aiFocused: false, online: true }));
