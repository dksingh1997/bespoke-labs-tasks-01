# PCC Compiler Optimization Task

A [Harbor](https://github.com/laude-institute/harbor) task for evaluating AI agents on compiler optimization. Agents must improve the code generation quality of the [Portable C Compiler (PCC)](http://pcc.ludd.ltu.se/) to produce faster executables.

## The Challenge

PCC is a historically significant C compiler dating back to the 1970s, rewritten for modern systems. While it compiles C code correctly, it produces slower executables than modern optimizing compilers like GCC. The goal is to modify PCC's source code to generate faster machine code without breaking correctness.

## Quick Start

1. **Install dependencies**
   ```bash
   # Build tools
   sudo apt-get update && sudo apt-get install -y build-essential bison flex
   
   # Docker and Docker Compose
   sudo apt-get install -y docker.io docker-compose-v2
   sudo usermod -aG docker $USER
   sudo systemctl start docker
   
   # uv (Python package manager)
   curl -LsSf https://astral.sh/uv/install.sh | sh
   source $HOME/.local/bin/env
   
   # Harbor
   uv tool install harbor
   ```

2. **Set up API keys**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Run an agent**
   ```bash
   ./run_claude.sh   # Claude Code with Opus 4.6
   ./run_codex.sh    # OpenAI Codex
   ```

## Reward Function

Simple and strict: **correctness is a gate, reward is pure speedup**.

**Gates** (reward = 0 if violated):
- Any correctness regression (test that baseline PCC passed but modified PCC fails)

**Reward** (discrete steps to avoid measurement noise):

| Speedup Range | Reward | Notes |
|---------------|--------|-------|
| < 1.05x       | 0.0    | No significant improvement (measurement noise) |
| 1.05x - 1.10x | 0.1    | Small improvement (~5-10% faster) |
| 1.10x - 1.15x | 0.2    | Moderate improvement (~10-15% faster) |
| 1.15x - 1.20x | 0.3    | Good improvement (~15-20% faster) |
| 1.20x - 1.30x | 0.4    | Better improvement (~20-30% faster) |
| 1.30x - 1.40x | 0.5    | Great improvement (~30-40% faster) |
| 1.40x - 1.50x | 0.6    | Excellent improvement (~40-50% faster) |
| 1.50x - 2.0x  | 0.7    | Amazing improvement (~50-100% faster) |
| 2.0x - 3.0x   | 0.8    | Outstanding (2-3x faster) |
| 3.0x - 4.0x   | 0.9    | Exceptional (3-4x faster) |
| ≥ 4.0x        | 1.0    | Perfect (4x+ faster) |

Where:
- `speedup` = modified PCC speed / baseline PCC speed (geometric mean across benchmarks)
- Baseline PCC = unmodified PCC built with same bootstrap compiler
- Discrete steps prevent false positives from measurement noise

## Directory Structure

```
├── environment/              # Docker build context
│   ├── compiler-src/
│   │   ├── pcc/              # PCC source (agent modifies this)
│   │   └── pcc-libs/         # PCC runtime libraries
│   ├── scripts/              # Benchmark and test scripts
│   ├── benchmarks/           # CoreMark, GCC torture, etc.
│   └── Dockerfile
├── tests/                    # Verifier (copied after agent runs)
│   ├── test.sh               # Main verification script
│   ├── compute_reward.py     # Reward calculation
│   ├── baseline-pcc/         # Pristine PCC for baseline comparison
│   └── baseline-pcc-libs/    # Pristine pcc-libs
├── instruction.md            # Prompt given to the agent
├── task.toml                 # Task configuration
└── run_*.sh                  # Convenience scripts for running agents
```

## Key Differences from TCC Task

| Aspect | TCC | PCC |
|--------|-----|-----|
| Build System | Simple Makefile | autoconf (configure + make) |
| Self-hosting | Single `tcc` binary | Requires pcc-libs (crt*.o, libpcc.a) |
| Architecture | Monolithic | Separate cpp/ccom/pcc binaries |
| Code Generation | arch/x86_64-gen.c | arch/amd64/code.c, local.c, table.c |

## Testing Locally

Build and run the verifier without Harbor:

```bash
# Build the Docker image
cd environment && docker build -t pcc-test .

# Run verification (no agent changes)
docker run --rm \
  -v $(pwd)/../tests:/tests:ro \
  -v /tmp/output:/logs \
  pcc-test \
  /bin/bash -c "mkdir -p /logs/verifier /logs/agent && /tests/test.sh"

# Check results
cat /tmp/output/verifier/reward.json
```

## Agent Instructions

The agent receives `instruction.md` which tells it to modify PCC source, rebuild, test, and iterate until time runs out.

## PCC Architecture Overview

PCC uses a traditional multi-pass compiler architecture:

1. **cpp** - C preprocessor (handles #include, #define, etc.)
2. **ccom** - C compiler proper (parsing, optimization, code generation)
3. **pcc** - Driver program (orchestrates compilation pipeline)

Key optimization targets:
- `arch/amd64/code.c` - Main code generation
- `arch/amd64/local.c` - Local transformations
- `arch/amd64/table.c` - Instruction pattern matching
- `mip/optim2.c` - Machine-independent optimizations
- `cc/ccom/optim.c` - High-level optimizations
