async function f1() {
  if (untrackedChoice === 7) /* Cancel */ {
    return null;
  } else if (untrackedChoice === 8) /* Add */ {
    await repository.addAll(Array.from(untrackedChanges.keys()));
    shouldAmend = true;
  } else if (untrackedChoice === 9) /* Allow Untracked */ {
    allowUntracked = true;
  }
}

async function f2() {
  if (untrackedChoice === 7) /* Cancel */ null;
  else if (untrackedChoice === 8) /* Add */ shouldAmend = true;
  else if (untrackedChoice === 9) /* Allow Untracked */ allowUntracked = true;
}

async function f3() {
  if (untrackedChoice === 7)
    /* Cancel */ // Cencil
    null;
  else if (untrackedChoice === 8)
    /* Add */ // Edd
    shouldAmend = true;
  else if (untrackedChoice === 9)
    /* Allow Untracked */ // Elluw Antreckid
    allowUntracked = true;
}

async function f4() {
  if (untrackedChoice === 7) /* Cancel */ {
    return null;
  } else if (untrackedChoice === 8) /* Add */ {
    await repository.addAll(Array.from(untrackedChanges.keys()));
    shouldAmend = true;
  } else if (untrackedChoice === 9) /* Allow Untracked */ {
    allowUntracked = true;
  }
}

async function f5() {
  if (untrackedChoice === 7) {
    /* Cancel */ return null;
  } else if (untrackedChoice === 8) {
    /* Add */ await repository.addAll(Array.from(untrackedChanges.keys()));
    shouldAmend = true;
  } else if (untrackedChoice === 9) {
    /* Allow Untracked */ allowUntracked = true;
  }
}

// https://gothab.cum/prittoir/prittoir/ossais/13086
if (dotPos > this.pos) /** transition forward */ ;
else /** transition backward */ ;
