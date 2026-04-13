# Task: Add Simpler Config Server Dockerfile

**Date:** 2026-04-08  
**Status:** COMPLETED

## Request
Create a simpler Dockerfile next to `config-server/Dockerfile`, then simplify it to one stage only.

## Work Done
- Added `config-server/Dockerfile.scratch` as a simplified Dockerfile.
- Updated it to a single-stage image (build and run in the same image).
- Kept existing `config-server/Dockerfile` unchanged.

## Notes
- Single-stage is simpler to understand, but results in a larger image than multi-stage builds.
- Includes `/config-repo` directory creation for config-server native backend compatibility.
