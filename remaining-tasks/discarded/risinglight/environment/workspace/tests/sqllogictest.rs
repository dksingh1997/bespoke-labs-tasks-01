use std::path::Path;

use libtest_mimic::{Arguments, Trial};
use sqldb::{Database, Error};
use sqllogictest::{DBOutput, DefaultColumnType};
use tokio::runtime::Runtime;

fn main() {
    const PATTERN: &str = "tests/sql/**/[!_]*.slt";

    let mut tests = vec![];
    let paths = glob::glob(PATTERN).expect("failed to find test files");

    for entry in paths {
        let path = entry.expect("failed to read glob entry");
        let subpath = path
            .strip_prefix("tests/sql")
            .unwrap()
            .to_str()
            .unwrap()
            .to_string();
        let test_path = path.clone();
        tests.push(Trial::test(format!("mem::{}", subpath), move || {
            Ok(build_runtime().block_on(test(&test_path))?)
        }));
    }

    if tests.is_empty() {
        panic!(
            "no test found for sqllogictest! pwd: {:?}",
            std::env::current_dir().unwrap()
        );
    }

    libtest_mimic::run(&Arguments::from_args(), tests).exit();
}

fn build_runtime() -> Runtime {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
}

async fn test(filename: impl AsRef<Path>) -> Result<(), Box<dyn std::error::Error>> {
    let db = Database::new_in_memory();
    let db = DatabaseWrapper(db);
    let mut tester = sqllogictest::Runner::new(|| async { Ok(&db) });
    tester.run_file_async(filename).await?;
    Ok(())
}

struct DatabaseWrapper(Database);

#[async_trait::async_trait]
impl sqllogictest::AsyncDB for &DatabaseWrapper {
    type ColumnType = DefaultColumnType;
    type Error = Error;

    async fn run(
        &mut self,
        sql: &str,
    ) -> core::result::Result<DBOutput<Self::ColumnType>, Self::Error> {
        let is_query = {
            let lower = sql.trim_start().to_ascii_lowercase();
            lower.starts_with("select")
                || lower.starts_with("values")
                || lower.starts_with("show")
                || lower.starts_with("with")
                || lower.starts_with("describe")
        };

        let rows = self.0.run(sql).await?;

        if rows.is_empty() {
            if is_query {
                return Ok(DBOutput::Rows {
                    types: vec![],
                    rows: vec![],
                });
            }
            return Ok(DBOutput::StatementComplete(0));
        }

        let types = vec![DefaultColumnType::Any; rows[0].len()];
        Ok(DBOutput::Rows { types, rows })
    }
}
