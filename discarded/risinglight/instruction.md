Implement an in-memory OLAP database system in Rust from scratch. Your implementation must parse and execute SQL, and pass the provided suite of SQL logic tests in `tests/sql/`.

## What You Are Building

An educational SQL database engine that supports core relational operations: table creation, data insertion/deletion, queries with filtering, aggregation, grouping, sorting, joins, and subqueries.

## Architecture

A SQL query flows through these stages:

1. **Parser** — Transform the SQL string into an AST. Use the `sqlparser` crate (included in `Cargo.toml`).
2. **Binder / Analyzer** — Resolve table and column references against the catalog. Validate types.
3. **Planner** — Convert the AST into a logical plan tree: `Projection ← Aggregate ← Filter ← TableScan`, etc.
4. **Executor** — Walk the plan tree to produce result rows. Each node pulls data from its children, transforms it, and passes it up.

All storage is in-memory. No disk persistence is required.

## Public API

The test runner (`tests/sqllogictest.rs`) expects your library to export:

```rust
pub struct Database { /* your fields */ }

#[derive(Debug)]
pub struct Error(pub String);

impl std::fmt::Display for Error { /* ... */ }
impl std::error::Error for Error {}

impl Database {
    /// Create a new in-memory database.
    pub fn new_in_memory() -> Self;

    /// Execute a SQL statement.
    /// - Queries (SELECT, VALUES, WITH, SHOW, DESCRIBE): return rows as Vec<Vec<String>>.
    /// - Statements (CREATE, INSERT, DELETE, DROP): return an empty Vec on success.
    /// - Return Err on failure.
    pub async fn run(&self, sql: &str) -> Result<Vec<Vec<String>>, Error>;
}
```

You may change the test runner and the public API if you prefer a different interface, but the `.slt` test files must not be modified (they are restored before verification).

### Output Formatting

Each column value must be formatted as a `String`:

| Type | Format | Examples |
|------|--------|---------|
| Integer | Decimal | `1`, `-42` |
| Float/Double | Decimal, no unnecessary trailing zeros | `12.5`, `10234.567` |
| Boolean | Lowercase | `true`, `false` |
| String/Varchar | Raw value (no quotes) | `hello` |
| NULL | Literal | `NULL` |
| Date | ISO 8601 | `2001-02-16` |
| Division by zero (int) | | `NULL` |

## SQL Features Required

Based on the test suite, you must support:

**Core DDL & DML:**
- `CREATE TABLE` (column types, `NOT NULL`, `PRIMARY KEY`), `DROP TABLE`
- `INSERT INTO ... VALUES`, `INSERT INTO ... SELECT`, `DELETE FROM` (with optional `WHERE`)
- `REPLACE INTO` (upsert semantics)

**Queries:**
- `SELECT` (expressions, aliases, `*`), `SELECT DISTINCT`
- `WHERE`, `GROUP BY` (columns and expressions), `HAVING`
- `ORDER BY` (ASC/DESC, NULLs first), `LIMIT`, `OFFSET`

**Expressions & Operators:**
- Arithmetic: `+`, `-`, `*`, `/`
- Comparison: `>`, `<`, `>=`, `<=`, `=`, `!=`/`<>`
- Boolean: `AND`, `OR`, `NOT`
- String: `||` (concatenation)
- Null: `IS NULL`, `IS NOT NULL`
- Type casting: `::INT`, `::FLOAT`, `::DOUBLE`, `::SMALLINT`, `::BIGINT`

**Aggregates:**
- `SUM()`, `COUNT()`, `MIN()`, `MAX()`, `COUNT(*)`, `FIRST()`, `LAST()`

**Joins:**
- `INNER JOIN ... ON`, `LEFT JOIN ... ON`, `CROSS JOIN`, comma-separated tables
- Semi join / anti join (`WHERE EXISTS`, `WHERE NOT EXISTS`, `WHERE IN (subquery)`)
- Merge join (ordered input optimization)

**Subqueries:**
- In `FROM` clause with aliases
- Correlated and uncorrelated subqueries
- Common Table Expressions (`WITH ... AS`)

**Views:**
- `CREATE VIEW ... AS SELECT ...`, `DROP VIEW`
- Querying from views

**User-Defined Functions:**
- `CREATE FUNCTION ... RETURNS ... LANGUAGE SQL AS ...`
- Named and unnamed parameters, `RETURN` syntax
- Calling UDFs in queries

**Window Functions:**
- `ROW_NUMBER() OVER ()`, `SUM(...) OVER ()`

**Data Types:**
- `INT`, `SMALLINT`, `BIGINT`, `FLOAT`, `DOUBLE`, `BOOLEAN`
- `VARCHAR`, `CHAR`, `BLOB`
- `DATE`, `TIMESTAMP`, `INTERVAL`, `DECIMAL`
- `VECTOR(n)` (array of floats, formatted as `[1,2,3]`)

**Built-in Functions:**
- `EXTRACT(YEAR/MONTH/DAY FROM date)`
- `SUBSTRING(str FROM start FOR length)`
- `REPEAT(str, count)`
- String functions, date/timestamp arithmetic

**Catalog:**
- `SHOW TABLES`, `DESCRIBE table`

**Other:**
- Case-insensitive identifiers
- Integer overflow detection (return errors)
- Division by zero → `NULL` (for integers)
- NULL propagation in arithmetic/comparison, three-valued boolean logic
- Error handling: syntax errors, ambiguous columns, type mismatches

## Test Format

Tests use the [sqllogictest](https://www.sqlite.org/sqllogictest/doc/trunk/about.wiki) `.slt` format:

```
statement ok
CREATE TABLE t(v1 INT, v2 INT)

statement error
INVALID SQL HERE

query II rowsort
SELECT v1, v2 FROM t
----
1	2
3	4
```

- `statement ok` — expect success
- `statement error` — expect any error
- `query <types> [rowsort]` — run query, compare output after `----`
- Type chars: `I`=integer, `R`=real, `T`=text, `B`=boolean
- `rowsort` — rows may be in any order
- `halt` — stop processing the rest of the file

## Build & Test

```bash
# Build the project
cargo build

# Run all SQL logic tests
cargo test --test sqllogictest

# Run a specific test
cargo test --test sqllogictest -- "basic_test"

# Run with output visible
cargo test --test sqllogictest -- --nocapture
```

## Workspace Structure

```
├── Cargo.toml              # Dependencies (sqlparser, tokio, etc.)
├── src/
│   └── lib.rs              # YOUR IMPLEMENTATION GOES HERE
└── tests/
    ├── sqllogictest.rs      # Test runner (bridges your DB to sqllogictest)
    └── sql/
        └── *.slt            # 43 SQL test files (DO NOT MODIFY)
```

Your reward is proportional to the fraction of test files that pass. Each `.slt` file runs as an independent test with a fresh database instance. Files starting with `_` are helper files and are not run directly.
