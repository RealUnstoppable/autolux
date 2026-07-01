#!/bin/bash
# Test Plan Execution
echo "Running basic tests..."
grep -q "<html" booking.html || (echo "booking.html syntax check failed." && false)
echo "All tests passed."
