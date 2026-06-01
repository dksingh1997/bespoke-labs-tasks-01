/// Implement your database engine here. The test runner expects the public API below.
/// See instruction.md for the full specification.

#[derive(Debug)]
pub struct Error(pub String);

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl std::error::Error for Error {}

pub struct Database;

impl Database {
    pub fn new_in_memory() -> Self {
        Database
    }

    pub async fn run(&self, _sql: &str) -> Result<Vec<Vec<String>>, Error> {
        Err(Error("not implemented".to_string()))
    }
}
