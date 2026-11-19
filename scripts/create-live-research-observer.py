#!/usr/bin/env python3
"""Primary CLI for generating the bundled live research observer."""

from pathlib import Path
from runpy import run_path


if __name__ == "__main__":
    implementation = Path(__file__).with_name("create-model-live-observer.py")
    run_path(str(implementation), run_name="__main__")
