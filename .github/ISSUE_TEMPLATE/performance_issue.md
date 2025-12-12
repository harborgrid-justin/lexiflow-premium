---
name: Performance Issue
about: Report slow performance or resource issues
title: '[PERFORMANCE] '
labels: performance
assignees: ''
---

## Performance Problem
<!-- Describe the performance issue -->

## Metrics
- **Response Time:** <!-- e.g., 5000ms (expected < 500ms) -->
- **Memory Usage:** <!-- e.g., 2GB (expected < 500MB) -->
- **CPU Usage:** <!-- e.g., 80% (expected < 50%) -->
- **Database Query Time:** <!-- e.g., 2000ms (expected < 100ms) -->

## Component Affected
- [ ] Backend API
- [ ] Frontend Rendering
- [ ] Database Queries
- [ ] File Processing
- [ ] WebSocket

## Endpoint/Operation
**URL/Function:** <!-- e.g., GET /api/v1/cases -->
**Frequency:** <!-- How often this is called -->

## Performance Trace
```
<!-- Paste performance logs, slow query logs, or profiler output -->
```

## Database Query (if applicable)
```sql
-- Slow query here
```

## Load Testing Results
- **Concurrent Users:**
- **Requests Per Second:**
- **Average Response Time:**
- **95th Percentile:**
- **Error Rate:**

## Bottleneck Analysis
<!-- What's causing the slowdown -->
- [ ] N+1 Query Problem
- [ ] Missing Index
- [ ] Large Data Transfer
- [ ] Inefficient Algorithm
- [ ] Memory Leak
- [ ] Blocking Operations

## Proposed Optimization
<!-- How to fix this -->

## Related Files
-
-

---
**Reported by:** Agent 12 (Performance Testing)
**Date:** <!-- YYYY-MM-DD -->
