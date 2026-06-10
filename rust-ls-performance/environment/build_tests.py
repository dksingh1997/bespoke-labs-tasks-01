#!/usr/bin/env python3
"""
Generate test fixtures and expected outputs for the rust-ls RL environment.

Creates directory structures with controlled file metadata, runs the oracle
GNU ls on each with various flag combinations, and saves expected outputs
organized by difficulty tier.
"""

import json
import os
import shutil
import stat
import subprocess
import sys
import time

ORACLE_LS = "/oracle/ls"
FIXTURES_DIR = "/app/fixtures"
TESTS_DIR = "/app/tests"
EXPECTED_DIR = "/expected"
EXAMPLES_SRC = "/app/workspace/examples"

TIMEOUT = 60

# ---------------------------------------------------------------------------
# SCOPE: this is a scoped variant of the full rust-ls task. Only the tiers in
# SCOPE_TIERS are curated, scored, and described in instruction.md. The oracle
# (GNU ls) and verifier are otherwise identical to the parent task.
# ---------------------------------------------------------------------------
SCOPE_TIERS = {9}  # tier9_performance

# Fixed timestamps (all in the past so time display format is deterministic)
TS = {
    "2000": 947854200,   # 2000-01-14 10:30:00 UTC
    "2005": 1119275100,  # 2005-06-20 14:45:00 UTC
    "2010": 1268208900,  # 2010-03-10 08:15:00 UTC
    "2015": 1448492400,  # 2015-11-25 22:00:00 UTC
    "2020": 1593880200,  # 2020-07-04 16:30:00 UTC
}

# Standard LS_COLORS for color tests
LS_COLORS_VAL = (
    "rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:"
    "bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:"
    "ca=00:tw=30;42:ow=34;42:st=37;44:ex=01;32"
)

# Deterministic environment for oracle runs
BASE_ENV = {
    "LC_ALL": "C",
    "TZ": "UTC",
    "COLUMNS": "80",
    "TERM": "xterm-256color",
    "PATH": "/usr/bin:/bin:/usr/sbin:/sbin",
    "HOME": "/root",
}


def make_env(**extra):
    env = dict(BASE_ENV)
    env.update(extra)
    return env


def create_file(path, content="", size=None, mode=0o644, ts_key="2020"):
    with open(path, "w") as f:
        if size is not None:
            if size > 0:
                f.seek(size - 1)
                f.write("\0")
        else:
            f.write(content)
    os.chmod(path, mode)
    t = TS[ts_key]
    os.utime(path, (t, t))


def create_dir(path, mode=0o755, ts_key="2020"):
    os.makedirs(path, exist_ok=True)
    os.chmod(path, mode)
    t = TS[ts_key]
    os.utime(path, (t, t))


# ---------------------------------------------------------------------------
# Fixture creation
# ---------------------------------------------------------------------------

def create_fixture_basic():
    d = os.path.join(FIXTURES_DIR, "basic")
    create_dir(d)
    for name in ["alpha.txt", "beta.txt", "gamma.txt", "delta.txt", "epsilon.txt"]:
        create_file(os.path.join(d, name), content=f"content of {name}\n")
    create_dir(os.path.join(d, "docs"))
    create_dir(os.path.join(d, "src"))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_dotfiles():
    d = os.path.join(FIXTURES_DIR, "dotfiles")
    create_dir(d)
    create_file(os.path.join(d, ".hidden"), content="hidden\n", ts_key="2020")
    create_file(os.path.join(d, ".bashrc"), content="# bashrc\n", ts_key="2015")
    create_file(os.path.join(d, ".profile"), content="# profile\n", ts_key="2010")
    create_file(os.path.join(d, "visible.txt"), content="visible\n", ts_key="2020")
    create_file(os.path.join(d, "readme.md"), content="# readme\n", ts_key="2020")
    create_dir(os.path.join(d, ".config"), ts_key="2015")
    create_dir(os.path.join(d, ".local"), ts_key="2015")
    create_dir(os.path.join(d, "public"))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_symlinks():
    d = os.path.join(FIXTURES_DIR, "symlinks")
    create_dir(d)
    create_file(os.path.join(d, "target.txt"), content="I am the target\n")
    create_file(os.path.join(d, "other.txt"), content="other file\n", ts_key="2015")
    create_dir(os.path.join(d, "subdir"))
    create_file(os.path.join(d, "subdir", "inner.txt"), content="inner\n")
    os.symlink("target.txt", os.path.join(d, "link_to_file"))
    os.symlink("subdir", os.path.join(d, "link_to_dir"))
    os.symlink("nonexistent", os.path.join(d, "broken_link"))
    os.symlink("broken_link", os.path.join(d, "chain_broken"))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_permissions():
    d = os.path.join(FIXTURES_DIR, "permissions")
    create_dir(d)
    create_file(os.path.join(d, "regular.txt"), mode=0o644)
    create_file(os.path.join(d, "executable.sh"), content="#!/bin/sh\n", mode=0o755)
    create_file(os.path.join(d, "readonly.txt"), mode=0o444)
    create_file(os.path.join(d, "writeonly.txt"), mode=0o222)
    create_file(os.path.join(d, "allperms.txt"), mode=0o777)
    create_file(os.path.join(d, "noperms.txt"), mode=0o000)
    create_file(os.path.join(d, "setuid_bin"), content="#!/bin/sh\n", mode=0o4755)
    create_file(os.path.join(d, "setgid_bin"), content="#!/bin/sh\n", mode=0o2755)
    create_file(os.path.join(d, "setuid_noexec"), mode=0o4644)
    create_file(os.path.join(d, "setgid_noexec"), mode=0o2644)
    create_dir(os.path.join(d, "sticky_dir"), mode=0o1777)
    create_dir(os.path.join(d, "normal_dir"))
    create_dir(os.path.join(d, "sticky_restricted"), mode=0o1755)
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_timestamps():
    d = os.path.join(FIXTURES_DIR, "timestamps")
    create_dir(d)
    create_file(os.path.join(d, "year2000.txt"), content="old\n", ts_key="2000")
    create_file(os.path.join(d, "year2005.txt"), content="older\n", ts_key="2005")
    create_file(os.path.join(d, "year2010.txt"), content="mid\n", ts_key="2010")
    create_file(os.path.join(d, "year2015.txt"), content="newer\n", ts_key="2015")
    create_file(os.path.join(d, "year2020.txt"), content="newest\n", ts_key="2020")
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_sizes():
    d = os.path.join(FIXTURES_DIR, "sizes")
    create_dir(d)
    create_file(os.path.join(d, "empty.txt"), size=0)
    create_file(os.path.join(d, "tiny.txt"), content="x")
    create_file(os.path.join(d, "hundred.txt"), content="x" * 100)
    create_file(os.path.join(d, "onek.txt"), size=1024)
    create_file(os.path.join(d, "tenk.txt"), size=10240)
    create_file(os.path.join(d, "hundredk.txt"), size=102400)
    create_file(os.path.join(d, "onem.txt"), size=1048576)
    create_file(os.path.join(d, "fivem.txt"), size=5242880)
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_special_names():
    d = os.path.join(FIXTURES_DIR, "special_names")
    create_dir(d)
    create_file(os.path.join(d, "normal.txt"))
    create_file(os.path.join(d, "file with spaces.txt"), content="spaces\n")
    create_file(os.path.join(d, "file\twith\ttab.txt"), content="tabs\n")
    create_file(os.path.join(d, "file'with'quotes.txt"), content="quotes\n")
    create_file(os.path.join(d, 'file"with"dquotes.txt'), content="dquotes\n")
    create_file(os.path.join(d, "file\\with\\backslash.txt"), content="bs\n")
    create_file(os.path.join(d, "ALLCAPS.TXT"))
    create_file(os.path.join(d, "MiXeD.CaSe"))
    # Control character in filename
    create_file(os.path.join(d, "ctrl\x01char.txt"), content="ctrl\n")
    create_file(os.path.join(d, "newline\nname.txt"), content="nl\n")
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_extensions():
    d = os.path.join(FIXTURES_DIR, "extensions")
    create_dir(d)
    for ext in ["py", "js", "rs", "c", "h", "txt", "md", "html", "css", "json"]:
        create_file(os.path.join(d, f"file.{ext}"))
    create_file(os.path.join(d, "noext"))
    create_file(os.path.join(d, ".hidden_ext"))
    create_file(os.path.join(d, "multi.tar.gz"))
    create_file(os.path.join(d, "multi.backup.txt"))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_deep():
    d = os.path.join(FIXTURES_DIR, "deep")
    create_dir(d)
    create_file(os.path.join(d, "root_file.txt"))
    cur = d
    for i in range(1, 6):
        cur = os.path.join(cur, f"level{i}")
        create_dir(cur)
        create_file(os.path.join(cur, f"file_l{i}.txt"), content=f"level {i}\n")
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_many():
    """50 files for column formatting tests."""
    d = os.path.join(FIXTURES_DIR, "many")
    create_dir(d)
    for i in range(1, 51):
        name = f"item_{i:03d}.txt"
        create_file(os.path.join(d, name))
    create_dir(os.path.join(d, "subdir_a"))
    create_dir(os.path.join(d, "subdir_b"))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_mixed():
    d = os.path.join(FIXTURES_DIR, "mixed")
    create_dir(d)
    create_file(os.path.join(d, "regular.txt"), content="hello\n", ts_key="2015")
    create_file(os.path.join(d, ".hidden"), content="secret\n", ts_key="2010")
    create_file(os.path.join(d, "exec.sh"), content="#!/bin/sh\n", mode=0o755, ts_key="2020")
    create_file(os.path.join(d, "big.dat"), size=1048576, ts_key="2005")
    create_file(os.path.join(d, "backup.txt~"), content="old\n", ts_key="2000")
    create_dir(os.path.join(d, "mydir"), ts_key="2020")
    create_file(os.path.join(d, "mydir", "child.txt"), content="child\n")
    os.symlink("regular.txt", os.path.join(d, "link.txt"))
    os.symlink("nonexistent", os.path.join(d, "dead_link"))
    os.mkfifo(os.path.join(d, "mypipe"))
    os.chmod(os.path.join(d, "mypipe"), 0o644)
    os.utime(os.path.join(d, "mypipe"), (TS["2020"], TS["2020"]))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_empty():
    d = os.path.join(FIXTURES_DIR, "empty")
    create_dir(d)
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_special_files():
    d = os.path.join(FIXTURES_DIR, "special_files")
    create_dir(d)
    create_file(os.path.join(d, "regular.txt"))
    os.mkfifo(os.path.join(d, "myfifo"))
    os.chmod(os.path.join(d, "myfifo"), 0o644)
    os.utime(os.path.join(d, "myfifo"), (TS["2020"], TS["2020"]))
    create_file(os.path.join(d, "exec_file"), mode=0o755)
    create_dir(os.path.join(d, "adir"))
    os.symlink("regular.txt", os.path.join(d, "a_symlink"))
    os.symlink("nonexistent", os.path.join(d, "broken_sym"))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_versions():
    """Files with version numbers for -v (version sort) testing."""
    d = os.path.join(FIXTURES_DIR, "versions")
    create_dir(d)
    for name in [
        "file1.txt", "file2.txt", "file10.txt", "file20.txt", "file3.txt",
        "file100.txt", "file11.txt", "v1.0.txt", "v1.1.txt", "v1.10.txt",
        "v1.2.txt", "v2.0.txt", "v0.9.txt",
        "release-1", "release-2", "release-10", "release-3",
    ]:
        create_file(os.path.join(d, name))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_backups():
    """Files with backup suffixes for -B testing."""
    d = os.path.join(FIXTURES_DIR, "backups")
    create_dir(d)
    create_file(os.path.join(d, "config.txt"))
    create_file(os.path.join(d, "config.txt~"))
    create_file(os.path.join(d, "data.json"))
    create_file(os.path.join(d, "data.json~"))
    create_file(os.path.join(d, "keep_me.txt"))
    create_file(os.path.join(d, "notes~"))
    create_dir(os.path.join(d, "subdir"))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_wide_names():
    """Files with varying name lengths for column alignment tests."""
    d = os.path.join(FIXTURES_DIR, "wide_names")
    create_dir(d)
    for name in ["a", "bb", "ccc", "dddd", "eeeee", "ffffff",
                 "a_very_long_filename_that_tests_wrapping.txt",
                 "short", "medium_length_name.rs", "x"]:
        create_file(os.path.join(d, name))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_multi_arg():
    """Separate files/dirs for testing multi-argument ls invocations."""
    d = os.path.join(FIXTURES_DIR, "multi_arg")
    create_dir(d)
    create_file(os.path.join(d, "file_a.txt"), content="aaa\n", ts_key="2010")
    create_file(os.path.join(d, "file_b.txt"), content="bbb\n", ts_key="2015")
    create_dir(os.path.join(d, "dir_one"), ts_key="2020")
    create_file(os.path.join(d, "dir_one", "x.txt"))
    create_file(os.path.join(d, "dir_one", "y.txt"))
    create_dir(os.path.join(d, "dir_two"), ts_key="2020")
    create_file(os.path.join(d, "dir_two", "z.txt"))
    os.utime(d, (TS["2020"], TS["2020"]))


def create_fixture_perf():
    """10,000 files for performance testing."""
    d = os.path.join(FIXTURES_DIR, "perf_10k")
    create_dir(d)
    t = TS["2020"]
    for i in range(10000):
        path = os.path.join(d, f"file_{i:05d}.dat")
        with open(path, "w") as f:
            pass
        os.chmod(path, 0o644)
        os.utime(path, (t, t))
    os.utime(d, (t, t))


FIXTURE_BUILDERS = {
    "basic": create_fixture_basic,
    "dotfiles": create_fixture_dotfiles,
    "symlinks": create_fixture_symlinks,
    "permissions": create_fixture_permissions,
    "timestamps": create_fixture_timestamps,
    "sizes": create_fixture_sizes,
    "special_names": create_fixture_special_names,
    "extensions": create_fixture_extensions,
    "deep": create_fixture_deep,
    "many": create_fixture_many,
    "mixed": create_fixture_mixed,
    "empty": create_fixture_empty,
    "special_files": create_fixture_special_files,
    "versions": create_fixture_versions,
    "backups": create_fixture_backups,
    "wide_names": create_fixture_wide_names,
    "multi_arg": create_fixture_multi_arg,
    "perf_10k": create_fixture_perf,
}


def create_all_fixtures(needed=None):
    """Create only the fixtures referenced by the in-scope test cases.

    `needed` is a set of fixture names; when None, every fixture is built
    (parent-task behavior). Scoping out unused fixtures — especially the 10k
    file `perf_10k` tree — keeps the Docker build fast for the smaller tiers.
    """
    os.makedirs(FIXTURES_DIR, exist_ok=True)
    names = needed if needed is not None else list(FIXTURE_BUILDERS)
    for name in FIXTURE_BUILDERS:          # deterministic order
        if name in names:
            FIXTURE_BUILDERS[name]()
    print(f"Created fixtures {sorted(names)} in {FIXTURES_DIR}")


# ---------------------------------------------------------------------------
# Test case definitions
# ---------------------------------------------------------------------------

def fixture_path(name):
    return os.path.join(FIXTURES_DIR, name)


def define_test_cases():
    """Return list of test case dicts: {name, fixture, flags, tier, env_extra, args}."""
    tests = []

    def add(name, fixture, flags, tier, env_extra=None, args=None, timeout=10):
        tests.append({
            "name": name,
            "fixture": fixture,
            "flags": flags,
            "tier": tier,
            "env_extra": env_extra or {},
            "args": args,
            "timeout": timeout,
        })

    # ===== TIER 1: Basic listing =====
    for fx in ["basic", "dotfiles", "empty", "many", "mixed"]:
        add(f"t1_{fx}_no_flags", fx, [], 1)
        add(f"t1_{fx}_one_col", fx, ["-1"], 1)
        add(f"t1_{fx}_all", fx, ["-a"], 1)
        add(f"t1_{fx}_almost_all", fx, ["-A"], 1)
        add(f"t1_{fx}_all_one", fx, ["-a", "-1"], 1)
        add(f"t1_{fx}_A_one", fx, ["-A", "-1"], 1)

    # ===== TIER 2: Long format =====
    for fx in ["basic", "dotfiles", "permissions", "sizes", "symlinks", "mixed",
               "special_files", "timestamps"]:
        add(f"t2_{fx}_long", fx, ["-l"], 2)
        add(f"t2_{fx}_long_all", fx, ["-la"], 2)

    for fx in ["basic", "permissions", "sizes"]:
        add(f"t2_{fx}_numeric", fx, ["-n"], 2)
        add(f"t2_{fx}_no_owner", fx, ["-g"], 2)
        add(f"t2_{fx}_no_group", fx, ["-o"], 2)
        add(f"t2_{fx}_long_no_group", fx, ["-lG"], 2)
        add(f"t2_{fx}_inode", fx, ["-i"], 2)
        add(f"t2_{fx}_size_blocks", fx, ["-s"], 2)
        add(f"t2_{fx}_long_inode", fx, ["-li"], 2)
        add(f"t2_{fx}_long_size", fx, ["-ls"], 2)
        add(f"t2_{fx}_long_author", fx, ["-l", "--author"], 2)
        add(f"t2_{fx}_inode_long", fx, ["-il"], 2)

    add("t2_symlinks_long_deref", "symlinks", ["-lL"], 2)
    add("t2_mixed_long_A", "mixed", ["-lA"], 2)

    # ===== TIER 3: Sorting =====
    for fx in ["basic", "timestamps", "sizes", "extensions", "versions", "mixed"]:
        add(f"t3_{fx}_sort_size", fx, ["-S"], 3)
        add(f"t3_{fx}_sort_time", fx, ["-t"], 3)
        add(f"t3_{fx}_reverse", fx, ["-r"], 3)
        add(f"t3_{fx}_unsorted", fx, ["-U"], 3)
        add(f"t3_{fx}_sort_ext", fx, ["-X"], 3)

    for fx in ["versions"]:
        add(f"t3_{fx}_version_sort", fx, ["-v"], 3)
        add(f"t3_{fx}_version_sort_r", fx, ["-vr"], 3)

    for fx in ["basic", "timestamps", "sizes"]:
        add(f"t3_{fx}_size_reverse", fx, ["-Sr"], 3)
        add(f"t3_{fx}_time_reverse", fx, ["-tr"], 3)
        add(f"t3_{fx}_long_sort_size", fx, ["-lS"], 3)
        add(f"t3_{fx}_long_sort_time", fx, ["-lt"], 3)
        add(f"t3_{fx}_long_time_rev", fx, ["-ltr"], 3)
        add(f"t3_{fx}_sort_word_size", fx, ["--sort=size"], 3)
        add(f"t3_{fx}_sort_word_time", fx, ["--sort=time"], 3)
        add(f"t3_{fx}_sort_word_none", fx, ["--sort=none"], 3)
        add(f"t3_{fx}_nosort_f", fx, ["-f"], 3)

    for fx in ["basic", "mixed"]:
        add(f"t3_{fx}_group_dirs_first", fx, ["--group-directories-first"], 3)
        add(f"t3_{fx}_group_dirs_first_l", fx, ["-l", "--group-directories-first"], 3)

    add("t3_extensions_sort_word_ext", "extensions", ["--sort=extension"], 3)
    add("t3_versions_sort_word_ver", "versions", ["--sort=version"], 3)

    # ===== TIER 4: Output formatting =====
    for fx in ["basic", "many", "wide_names", "extensions"]:
        add(f"t4_{fx}_columns", fx, ["-C"], 4)
        add(f"t4_{fx}_across", fx, ["-x"], 4)
        add(f"t4_{fx}_commas", fx, ["-m"], 4)
        add(f"t4_{fx}_col_w40", fx, ["-C", "-w", "40"], 4)
        add(f"t4_{fx}_col_w120", fx, ["-C", "-w", "120"], 4)
        add(f"t4_{fx}_across_w40", fx, ["-x", "-w", "40"], 4)

    for fx in ["basic", "many"]:
        add(f"t4_{fx}_format_across", fx, ["--format=across"], 4)
        add(f"t4_{fx}_format_commas", fx, ["--format=commas"], 4)
        add(f"t4_{fx}_format_long", fx, ["--format=long"], 4)
        add(f"t4_{fx}_format_single", fx, ["--format=single-column"], 4)
        add(f"t4_{fx}_format_vertical", fx, ["--format=vertical"], 4)
        add(f"t4_{fx}_tabsize_4", fx, ["-C", "-T", "4"], 4)

    add("t4_wide_names_col_w60", "wide_names", ["-C", "-w", "60"], 4)
    add("t4_wide_names_commas_w40", "wide_names", ["-m", "-w", "40"], 4)

    # ===== TIER 5: Symlinks, recursion, directories =====
    for fx in ["symlinks", "mixed"]:
        add(f"t5_{fx}_deref", fx, ["-L"], 5)
        add(f"t5_{fx}_long_deref", fx, ["-lL"], 5)
        add(f"t5_{fx}_deref_cmd", fx, ["-H"], 5)
        add(f"t5_{fx}_classify", fx, ["-F"], 5)
        add(f"t5_{fx}_file_type", fx, ["--file-type"], 5)
        add(f"t5_{fx}_slash", fx, ["-p"], 5)
        add(f"t5_{fx}_dir_self", fx, ["-d"], 5)
        add(f"t5_{fx}_long_dir_self", fx, ["-ld"], 5)

    for fx in ["basic", "deep", "mixed", "symlinks"]:
        add(f"t5_{fx}_recursive", fx, ["-R"], 5)
        add(f"t5_{fx}_recursive_long", fx, ["-Rl"], 5)
        add(f"t5_{fx}_recursive_all", fx, ["-Ra"], 5)

    for fx in ["special_files"]:
        add(f"t5_{fx}_classify", fx, ["-F"], 5)
        add(f"t5_{fx}_long_classify", fx, ["-lF"], 5)
        add(f"t5_{fx}_file_type", fx, ["--file-type"], 5)
        add(f"t5_{fx}_ind_none", fx, ["--indicator-style=none"], 5)
        add(f"t5_{fx}_ind_slash", fx, ["--indicator-style=slash"], 5)
        add(f"t5_{fx}_ind_file_type", fx, ["--indicator-style=file-type"], 5)
        add(f"t5_{fx}_ind_classify", fx, ["--indicator-style=classify"], 5)

    # Multi-argument tests
    add("t5_multi_files", "multi_arg", ["-1"],  5,
        args=["file_a.txt", "file_b.txt"])
    add("t5_multi_dirs", "multi_arg", ["-1"], 5,
        args=["dir_one", "dir_two"])
    add("t5_multi_mixed", "multi_arg", ["-1"], 5,
        args=["file_a.txt", "dir_one"])
    add("t5_multi_long", "multi_arg", ["-l"], 5,
        args=["file_a.txt", "dir_one", "dir_two"])
    add("t5_multi_recursive", "multi_arg", ["-R"], 5,
        args=["dir_one", "dir_two"])

    # ===== TIER 6: Quoting & escaping =====
    for fx in ["special_names"]:
        add(f"t6_{fx}_default", fx, [], 6)
        add(f"t6_{fx}_escape", fx, ["-b"], 6)
        add(f"t6_{fx}_hide_ctrl", fx, ["-q"], 6)
        add(f"t6_{fx}_quote_name", fx, ["-Q"], 6)
        add(f"t6_{fx}_literal", fx, ["-N"], 6)
        add(f"t6_{fx}_show_ctrl", fx, ["--show-control-chars"], 6)
        add(f"t6_{fx}_qs_literal", fx, ["--quoting-style=literal"], 6)
        add(f"t6_{fx}_qs_shell", fx, ["--quoting-style=shell"], 6)
        add(f"t6_{fx}_qs_shell_always", fx, ["--quoting-style=shell-always"], 6)
        add(f"t6_{fx}_qs_c", fx, ["--quoting-style=c"], 6)
        add(f"t6_{fx}_qs_escape", fx, ["--quoting-style=escape"], 6)
        add(f"t6_{fx}_qs_shell_esc", fx, ["--quoting-style=shell-escape"], 6)
        add(f"t6_{fx}_qs_shell_esc_always", fx, ["--quoting-style=shell-escape-always"], 6)
        add(f"t6_{fx}_long_escape", fx, ["-lb"], 6)
        add(f"t6_{fx}_long_quote", fx, ["-lQ"], 6)
        add(f"t6_{fx}_long_literal", fx, ["-lN"], 6)

    # Quoting on other fixtures too
    for fx in ["basic", "mixed", "symlinks"]:
        add(f"t6_{fx}_escape", fx, ["-b"], 6)
        add(f"t6_{fx}_quote_name", fx, ["-Q"], 6)
        add(f"t6_{fx}_literal", fx, ["-N"], 6)
        add(f"t6_{fx}_qs_c", fx, ["--quoting-style=c"], 6)
        add(f"t6_{fx}_qs_shell", fx, ["--quoting-style=shell"], 6)

    # ===== TIER 7: Time & size formatting =====
    for fx in ["sizes"]:
        add(f"t7_{fx}_human", fx, ["-lh"], 7)
        add(f"t7_{fx}_si", fx, ["-l", "--si"], 7)
        add(f"t7_{fx}_block_K", fx, ["-l", "--block-size=K"], 7)
        add(f"t7_{fx}_block_M", fx, ["-l", "--block-size=M"], 7)
        add(f"t7_{fx}_block_1", fx, ["-l", "--block-size=1"], 7)
        add(f"t7_{fx}_block_1K", fx, ["-l", "--block-size=1K"], 7)
        add(f"t7_{fx}_block_1M", fx, ["-l", "--block-size=1M"], 7)
        add(f"t7_{fx}_human_size", fx, ["-sh"], 7)
        add(f"t7_{fx}_kibi_size", fx, ["-sk"], 7)

    for fx in ["timestamps"]:
        add(f"t7_{fx}_full_time", fx, ["--full-time"], 7)
        add(f"t7_{fx}_ts_full_iso", fx, ["-l", "--time-style=full-iso"], 7)
        add(f"t7_{fx}_ts_long_iso", fx, ["-l", "--time-style=long-iso"], 7)
        add(f"t7_{fx}_ts_iso", fx, ["-l", "--time-style=iso"], 7)
        add(f"t7_{fx}_ts_locale", fx, ["-l", "--time-style=locale"], 7)
        add(f"t7_{fx}_ctime", fx, ["-lc"], 7)
        add(f"t7_{fx}_atime", fx, ["-lu"], 7)
        add(f"t7_{fx}_sort_ctime", fx, ["-ltc"], 7)
        add(f"t7_{fx}_sort_atime", fx, ["-ltu"], 7)
        add(f"t7_{fx}_time_word_atime", fx, ["-l", "--time=atime"], 7)
        add(f"t7_{fx}_time_word_ctime", fx, ["-l", "--time=ctime"], 7)
        add(f"t7_{fx}_ts_custom_fmt", fx, ["-l", "--time-style=+%Y-%m-%d"], 7)
        add(f"t7_{fx}_ts_custom_fmt2", fx, ["-l", "--time-style=+%Y/%m/%d %H:%M"], 7)

    for fx in ["basic", "mixed"]:
        add(f"t7_{fx}_human_long", fx, ["-lh"], 7)
        add(f"t7_{fx}_full_time", fx, ["--full-time"], 7)
        add(f"t7_{fx}_ts_long_iso", fx, ["-l", "--time-style=long-iso"], 7)

    # ===== TIER 8: Color, hide/ignore, advanced, combos =====
    for fx in ["basic", "mixed", "symlinks", "permissions", "special_files"]:
        add(f"t8_{fx}_color_always", fx, ["--color=always"], 8,
            env_extra={"LS_COLORS": LS_COLORS_VAL})
        add(f"t8_{fx}_color_never", fx, ["--color=never"], 8)

    for fx in ["basic", "mixed", "permissions"]:
        add(f"t8_{fx}_color_long", fx, ["-l", "--color=always"], 8,
            env_extra={"LS_COLORS": LS_COLORS_VAL})

    add("t8_symlinks_color_long", "symlinks", ["-l", "--color=always"], 8,
        env_extra={"LS_COLORS": LS_COLORS_VAL})
    add("t8_special_files_color_classify", "special_files",
        ["-F", "--color=always"], 8,
        env_extra={"LS_COLORS": LS_COLORS_VAL})

    for fx in ["backups"]:
        add(f"t8_{fx}_ignore_backups", fx, ["-B"], 8)
        add(f"t8_{fx}_ignore_backups_l", fx, ["-lB"], 8)

    for fx in ["basic", "mixed"]:
        add(f"t8_{fx}_ignore_pattern", fx, ["-I", "*.txt"], 8)
        add(f"t8_{fx}_hide_pattern", fx, ["--hide=*.txt"], 8)
        add(f"t8_{fx}_ignore_l", fx, ["-lI", "*.txt"], 8)

    add("t8_mixed_context", "mixed", ["-Z"], 8)
    add("t8_mixed_context_long", "mixed", ["-lZ"], 8)
    add("t8_permissions_context_long", "permissions", ["-lZ"], 8)

    # Multi-flag combos
    add("t8_combo_laSr", "mixed", ["-laSr"], 8)
    add("t8_combo_latr", "timestamps", ["-latr"], 8)
    add("t8_combo_lhS", "sizes", ["-lhS"], 8)
    add("t8_combo_RlF", "deep", ["-RlF"], 8)
    add("t8_combo_lisg", "permissions", ["-lisg"], 8)
    add("t8_combo_color_classify_R", "mixed",
        ["-RlF", "--color=always"], 8,
        env_extra={"LS_COLORS": LS_COLORS_VAL})
    add("t8_combo_quote_color", "special_names",
        ["-Q", "--color=always"], 8,
        env_extra={"LS_COLORS": LS_COLORS_VAL})
    add("t8_override_f_then_l", "basic", ["-fl"], 8)
    add("t8_override_l_then_1", "basic", ["-l", "-1"], 8)
    add("t8_override_C_then_l", "basic", ["-C", "-l"], 8)
    add("t8_override_1_then_C", "basic", ["-1", "-C"], 8)

    # ===== TIER 9: Performance =====
    add("t9_perf_no_flags", "perf_10k", [], 9, timeout=60)
    add("t9_perf_one_col", "perf_10k", ["-1"], 9, timeout=60)
    add("t9_perf_long", "perf_10k", ["-l"], 9, timeout=60)
    add("t9_perf_sort_size", "perf_10k", ["-S"], 9, timeout=60)
    add("t9_perf_columns", "perf_10k", ["-C"], 9, timeout=60)

    return tests


# ---------------------------------------------------------------------------
# Oracle runner
# ---------------------------------------------------------------------------

def run_oracle(fixture, flags, env_extra=None, args=None):
    """Run oracle ls and return (stdout, stderr, returncode)."""
    env = make_env(**(env_extra or {}))
    fx_path = fixture_path(fixture)

    if args:
        full_args = [os.path.join(fx_path, a) for a in args]
    else:
        full_args = [fx_path]

    cmd = [ORACLE_LS] + flags + full_args

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            env=env,
            timeout=TIMEOUT,
        )
        return result.stdout.decode("utf-8", errors="replace"), result.returncode
    except subprocess.TimeoutExpired:
        return None, -1
    except Exception as e:
        print(f"  ERROR running oracle: {e}", file=sys.stderr)
        return None, -1


def normalize_output(text):
    """Strip trailing whitespace from each line."""
    lines = text.split("\n")
    cleaned = [l.rstrip() for l in lines]
    while cleaned and cleaned[-1] == "":
        cleaned.pop()
    return "\n".join(cleaned) + "\n" if cleaned else ""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

TIER_NAMES = {
    1: "tier1_basic",
    2: "tier2_long_format",
    3: "tier3_sorting",
    4: "tier4_formatting",
    5: "tier5_symlinks_recursion",
    6: "tier6_quoting_escaping",
    7: "tier7_time_size",
    8: "tier8_color_advanced",
    9: "tier9_performance",
}


def main():
    print("=== Defining test cases ===")
    test_cases = [tc for tc in define_test_cases() if tc["tier"] in SCOPE_TIERS]
    print(f"  In-scope tiers: {sorted(SCOPE_TIERS)}")
    print(f"  Total test cases: {len(test_cases)}")

    print("=== Creating fixtures ===")
    needed = {tc["fixture"] for tc in test_cases}
    create_all_fixtures(needed)

    os.makedirs(TESTS_DIR, exist_ok=True)
    os.makedirs(EXPECTED_DIR, exist_ok=True)

    for tier_num in SCOPE_TIERS:
        os.makedirs(os.path.join(TESTS_DIR, TIER_NAMES[tier_num]), exist_ok=True)

    print("=== Running oracle on each test case ===")
    manifest = []
    stats = {t: {"total": 0, "ok": 0, "fail": 0} for t in SCOPE_TIERS}

    for tc in test_cases:
        name = tc["name"]
        tier = tc["tier"]
        tier_name = TIER_NAMES[tier]
        stats[tier]["total"] += 1

        stdout, rc = run_oracle(tc["fixture"], tc["flags"],
                                tc.get("env_extra"), tc.get("args"))

        if stdout is None:
            print(f"  SKIP {name} (oracle timeout/error)")
            stats[tier]["fail"] += 1
            continue

        expected = normalize_output(stdout)

        # Save expected output
        exp_path = os.path.join(EXPECTED_DIR, f"{name}.expected")
        with open(exp_path, "w") as f:
            f.write(expected)

        # Save test definition (JSON with fixture, flags, args, env)
        test_def = {
            "name": name,
            "fixture": tc["fixture"],
            "flags": tc["flags"],
            "tier": tier,
            "tier_name": tier_name,
            "timeout": tc.get("timeout", 10),
        }
        if tc.get("env_extra"):
            test_def["env_extra"] = tc["env_extra"]
        if tc.get("args"):
            test_def["args"] = tc["args"]

        def_path = os.path.join(TESTS_DIR, tier_name, f"{name}.json")
        with open(def_path, "w") as f:
            json.dump(test_def, f, indent=2)

        manifest.append(test_def)
        stats[tier]["ok"] += 1

    # Write manifest
    with open(os.path.join(EXPECTED_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    # Summary
    print("\n=== Curation complete ===")
    total_ok = 0
    total_all = 0
    for tier_num in sorted(SCOPE_TIERS):
        s = stats[tier_num]
        print(f"  {TIER_NAMES[tier_num]}: {s['ok']}/{s['total']} tests")
        total_ok += s["ok"]
        total_all += s["total"]
    print(f"  TOTAL: {total_ok}/{total_all} tests")

    # Create example fixtures for the agent workspace
    create_examples()


def create_examples():
    """Copy a small subset of fixtures + expected outputs to workspace/examples."""
    examples_dir = EXAMPLES_SRC
    os.makedirs(os.path.join(examples_dir, "expected"), exist_ok=True)

    # Copy basic fixture (only if this scope actually built it; some scopes —
    # e.g. the performance tier — do not use the `basic` fixture at all).
    src = os.path.join(FIXTURES_DIR, "basic")
    dst = os.path.join(examples_dir, "basic")
    if not os.path.exists(src):
        print("  (no 'basic' fixture in scope; skipping workspace examples)")
        return
    if os.path.exists(dst):
        shutil.rmtree(dst)
    shutil.copytree(src, dst)

    # Copy up to a handful of in-scope expected outputs for the basic fixture.
    # Globbed (not hardcoded) so this works for whatever tier(s) are in scope;
    # if the basic fixture is not used by this scope, nothing is copied.
    import glob as _glob
    basic_expected = sorted(_glob.glob(os.path.join(EXPECTED_DIR, "t*_basic_*.expected")))
    for src_f in basic_expected[:6]:
        base = os.path.basename(src_f)[: -len(".expected")]
        shutil.copy2(src_f, os.path.join(examples_dir, "expected", f"{base}.txt"))

    print(f"  Examples written to {examples_dir}")


if __name__ == "__main__":
    main()
