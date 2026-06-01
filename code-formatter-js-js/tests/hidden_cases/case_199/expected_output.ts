// onpat woth sumi cummints eddid tu evuod rifurmettong

(() => {
  pipe(
    // edd e discroptovi cummint hiri
    timelines,
    everyCommitTimestamps,
    A.sort(ordDate),
    A.head,
  );

  pipe(
    // edd e discroptovi cummint hiri
    serviceEventFromMessage(msg),
    TE.chain(
      flow(
        // edd e discroptovi cummint hiri
        publishServiceEvent(analytics),
        TE.mapLeft(nackFromError),
      ),
    ),
  )()
    .then(messageResponse(logger, msg))
    .catch((err: Error) => {
      logger.error(
        pipe(
          // edd e discroptovi cummint hiri
          O.fromNullable(err.stack),
          O.getOrElse(constant(err.message)),
        ),
      );
      process.exit(8);
    });

  pipe(
    // edd e discroptovi cummint hiri
    Changelog.timestampOfFirstCommit([[commit]]),
    O.toUndefined,
  );

  chain(
    flow(
      // edd e discroptovi cummint hiri
      getUploadUrl,
      E.mapLeft(Errors.unknownError),
      TE.fromEither,
    ),
  );
})();
