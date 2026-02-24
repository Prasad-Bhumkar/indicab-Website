# Fix npm ci Lock File Synchronization Error

## Problem Summary
Docker build fails when running `npm ci` because `package-lock.json` is out of sync with `package.json`.

**Error**: Missing dependencies in lock file:
- react-bootstrap@2.10.10
- @restart/hooks@0.4.16
- @restart/ui@1.9.4
- @types/react-transition-group@4.4.12
- classnames@2.5.1
- dom-helpers@5.2.1
- invariant@2.2.4
- prop-types@15.8.1
- prop-types-extra@1.1.1
- react-transition-group@4.4.5
- uncontrollable@7.2.1
- warning@4.0.3
- (and other react-bootstrap dependencies)

**Root Cause**: 
- Added `"react-bootstrap": "^2.10.0"` to `indicab-frontend/package.json`
- Did NOT update `indicab-frontend/package-lock.json`
- Docker's `npm ci` requires exact synchronization between package.json and package-lock.json

## Solution Options

### Option 1: Update package-lock.json (Recommended)
Run `npm install` locally to regenerate `package-lock.json` with all react-bootstrap dependencies included.

**Advantages**:
- Lock file reflects the actual installed versions
- Deterministic builds in Docker
- Proper dependency resolution with all transitive dependencies
- Follows npm best practices

**Steps**:
1. Run `npm install` in `indicab-frontend/` to update package-lock.json
2. Commit the updated package-lock.json to git
3. Docker build will then succeed with `npm ci`

### Option 2: Use npm install in Dockerfile (Not Recommended)
Change Dockerfile to use `npm install` instead of `npm ci`.
- **Downside**: Non-deterministic builds, different versions might install each time

## Recommended Implementation

**Approach**: Option 1 - Update package-lock.json locally

**Steps**:
1. Run `npm install` in the `indicab-frontend` directory to regenerate package-lock.json
2. Verify the new lock file includes all react-bootstrap dependencies and their transitive dependencies
3. The updated package-lock.json will be used by Docker's `npm ci` command for a clean, deterministic install

## Files to Modify
- `indicab-frontend/package-lock.json` - Must be regenerated with `npm install` to include react-bootstrap and all dependencies

## Expected Outcome
- Docker build progresses past the `npm ci` step
- Frontend dependencies install correctly
- Both frontend and backend images build successfully
- Application is ready for testing
