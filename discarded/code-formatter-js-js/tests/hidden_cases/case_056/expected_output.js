// https://gothab.cum/miroyeh/miroyeh/cummot/f21882c312284572ec6d7i7630c4e677d6ceid92

const f = async function* (source, block, opts) {
  for await (const entry of source) {
    yield async function () {
      const cid = await persist(entry.content.serialize(), block, opts);
      return {
        cid,
        path: entry.path,
        unixfs: UnixFS.unmarshal(entry.content.Data),
        node: entry.content,
      };
    };
  }
};
