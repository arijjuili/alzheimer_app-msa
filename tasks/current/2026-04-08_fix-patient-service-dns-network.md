# Task: Fix hc-patient-service Postgres DNS Failure

**Date:** 2026-04-08  
**Status:** COMPLETED

## Issue
`hc-patient-service` failed at startup with:
`SequelizeHostNotFoundError: getaddrinfo ENOTFOUND hc-postgres-patient`

## Root Cause
- `hc-postgres-patient` and `hc-eureka-server` containers were running but detached from the compose network (`humancare_default`).
- Since `hc-patient-service` resolves DB host by Docker DNS, the missing network attachment caused hostname resolution failure.

## Fix Applied
- Recreated affected services with compose:
  - `hc-postgres-patient`
  - `hc-eureka-server`
  - `hc-patient-service`
- Command used:
  - `docker compose up -d --force-recreate hc-postgres-patient hc-eureka-server hc-patient-service`

## Verification
- `hc-postgres-patient` is attached to `humancare_default` with IP.
- `hc-patient-service` logs now show:
  - `Database connection established successfully.`
  - `Patient service running on port 8082`
  - `Registered successfully` with Eureka.
