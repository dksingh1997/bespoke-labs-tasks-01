// Variant test file
stopDirectory = await (
  useCache ? memoizedFindProjectRoot : findProjectRootWithoutCache
)(path.dirname(path.resolve(filePath)));
