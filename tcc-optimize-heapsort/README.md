# TCC Compiler Optimization Task

A [Harbor](https://github.com/laude-institute/harbor) task for evaluating AI agents on compiler optimization. Agents must improve the code generation quality of the [Tiny C Compiler (TCC)](https://bellard.org/tcc/) to produce faster executables.

## The Challenge

TCC compiles C code extremely fast but produces slow executables — roughly **4-5x slower** than GCC with `-O3`. The goal is to modify TCC's source code to generate faster machine code without breaking correctness.

## Quick Start

1. **Install dependencies**
   ```bash
   # Build tools
   sudo apt-get update && sudo apt-get install -y build-essential
   
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
- Any correctness regression (test that baseline TCC passed but modified TCC fails)

**Reward** (discrete steps to avoid measurement noise):

| Speedup Range | Reward | Notes |
|---------------|--------|-------|
| < 1.1x        | 0.0    | No significant improvement (measurement noise) |
| 1.1x - 1.3x   | 0.1    | Small improvement (~10-30% faster) |
| 1.3x - 1.5x   | 0.2    | Moderate improvement (~30-50% faster) |
| 1.5x - 2.0x   | 0.4    | Good improvement (50-100% faster) |
| 2.0x - 3.0x   | 0.6    | Great improvement (2-3x faster) |
| 3.0x - 4.0x   | 0.8    | Excellent improvement (3-4x faster) |
| ≥ 4.0x        | 1.0    | Perfect (4x+ faster) |

Where:
- `speedup` = modified TCC speed / baseline TCC speed (geometric mean across benchmarks)
- Baseline TCC = unmodified TCC built with same bootstrap compiler
- Discrete steps prevent false positives from measurement noise

## Directory Structure

```
├── environment/           # Docker build context
│   ├── compiler-src/tcc/  # TCC source (agent modifies this)
│   ├── scripts/           # Benchmark and test scripts
│   ├── benchmarks/        # CoreMark, GCC torture, etc.
│   └── Dockerfile
├── tests/                 # Verifier (copied after agent runs)
│   ├── test.sh            # Main verification script
│   ├── compute_reward.py  # Reward calculation
│   └── baseline-tcc/      # Pristine TCC for baseline comparison
├── instruction.md         # Prompt given to the agent
├── task.toml              # Task configuration
└── run_*.sh               # Convenience scripts for running agents
```

## Testing Locally

Build and run the verifier without Harbor:

```bash
# Build the Docker image
cd environment && docker build -t tcc-test .

# Run verification (no agent changes)
docker run --rm \
  -v $(pwd)/../tests:/tests:ro \
  -v /tmp/output:/logs \
  tcc-test \
  /bin/bash -c "mkdir -p /logs/verifier /logs/agent && /tests/test.sh"

# Check results
cat /tmp/output/verifier/reward.json
```

## Agent Instructions

The agent receives `instruction.md` which tells it to modify TCC source, rebuild, test, and iterate until time runs out.

## Rollout Results

Early evaluation runs reveal distinct failure modes for different agents:

### Claude Opus 4.6 (claude-code)

**Pattern**: Ambitious but self-destructive

Opus attempts sophisticated optimizations:
- Multiply-by-constant → LEA/shift sequences
- Binary peephole optimizer (post-emission x86 pattern matching)
- Signed division by power-of-2 → shift sequences
- LEA+MOV coalescing

These introduce correctness regressions (194 failing tests in one run). Opus then spends the remaining time debugging and bisecting, but times out before restoring a working state. Final result: **reward = 0** due to correctness gate, with performance actually *worse* than baseline.

**Failure mode**: Over-ambitious → regressions → debugging spiral → timeout

### OpenAI Codex (gpt-5.2-codex)

**Pattern**: Too conservative or shortcuts

Codex tends to wrap up within ~15 minutes despite the prompt clearly stating a 1.5-2 hour time budget. It takes one of two approaches:
1. **Conservative**: Makes minimal changes, achieves no meaningful performance improvement. Reward ≈ 0.
2. **Shortcut**: Attempts to make TCC shell out to GCC for compilation, which technically improves benchmark scores but defeats the purpose of the task.

**Failure mode**: Premature exit, either too cautious (no improvement) or gaming the metric (cheating)
