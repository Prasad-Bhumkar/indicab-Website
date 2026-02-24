# Fix Docker Backend Build Error

## Problem Summary
The Docker build is failing with the error:
```
ERROR: process "/bin/sh -c addgroup -g 1000 appuser &&     adduser -D -u 1000 -G appuser appuser" did not complete successfully: exit code: 1
```

The backend Dockerfile is using Alpine Linux user creation commands on a Debian-based image.

## Root Cause
**File**: `indicab-backend/Dockerfile` (lines 23-24)

The Dockerfile uses:
- `addgroup -g 1000 appuser` (Alpine syntax)
- `adduser -D -u 1000 -G appuser appuser` (Alpine syntax with `-D` flag)

But the base image is `eclipse-temurin:17-jre-jammy` (Debian-based), which requires:
- `groupadd -g 1000 appuser` (Debian syntax)
- `useradd -u 1000 -g appuser appuser` (Debian syntax without `-D`)

## Recommended Solution
Fix the user creation commands in `indicab-backend/Dockerfile` to use Debian-compatible syntax:

**Change**:
```dockerfile
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser
```

**To**:
```dockerfile
RUN groupadd -g 1000 appuser && \
    useradd -u 1000 -g appuser appuser
```

## Implementation Steps

1. **Read** `indicab-backend/Dockerfile` to confirm current content
2. **Fix** the user creation commands (lines 23-24) to use Debian-compatible syntax
3. **Verify** the change is correct
4. **Test** the docker-compose build works with: `docker-compose up --build`

## Files to Modify
- `indicab-backend/Dockerfile` - Replace Alpine commands with Debian/Linux equivalents

## Additional Notes
- This change uses standard Linux user creation tools that work on Debian-based systems
- The functionality remains the same (creates user with UID 1000 in group with GID 1000)
- No other changes needed to docker-compose or other files
- The frontend Dockerfile uses Alpine correctly and doesn't need changes
