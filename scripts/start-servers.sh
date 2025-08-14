#!/bin/bash

# ConstructBMS & ProjectPlanner Server Startup Script
# This script kills all existing processes and starts both servers fresh

set -e  # Exit on any error

echo "🚀 Starting ConstructBMS & ProjectPlanner Servers..."
echo "=================================================="

# Function to kill processes by port
kill_port() {
    local port=$1
    echo "🔴 Killing processes on port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 1
}

# Function to kill processes by name
kill_processes() {
    echo "🔴 Killing all development processes..."
    pkill -f "vite" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "node.*vite" 2>/dev/null || true
    sleep 2
}

# Function to clean up build artifacts
cleanup() {
    echo "🧹 Cleaning up build artifacts..."
    cd /Users/napwoodconstruction/Desktop/ConstructBMS/apps/ConstructBMS
    rm -rf node_modules/.vite 2>/dev/null || true
    rm -rf dist 2>/dev/null || true
    
    cd /Users/napwoodconstruction/Desktop/ConstructBMS/apps/ProjectPlanner
    rm -rf node_modules/.vite 2>/dev/null || true
    rm -rf dist 2>/dev/null || true
}

# Function to start ConstructBMS server
start_constructbms() {
    echo "🟢 Starting ConstructBMS on port 5173..."
    cd /Users/napwoodconstruction/Desktop/ConstructBMS/apps/ConstructBMS
    npm run dev > /dev/null 2>&1 &
    local constructbms_pid=$!
    echo "   ConstructBMS PID: $constructbms_pid"
    sleep 3
}

# Function to start ProjectPlanner server
start_projectplanner() {
    echo "🟢 Starting ProjectPlanner on port 5174..."
    cd /Users/napwoodconstruction/Desktop/ConstructBMS/apps/ProjectPlanner
    npm run dev > /dev/null 2>&1 &
    local projectplanner_pid=$!
    echo "   ProjectPlanner PID: $projectplanner_pid"
    sleep 3
}

# Function to verify servers are running
verify_servers() {
    echo "🔍 Verifying servers..."
    
    # Check ConstructBMS
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "   ✅ ConstructBMS is running on http://localhost:5173"
    else
        echo "   ❌ ConstructBMS failed to start"
        return 1
    fi
    
    # Check ProjectPlanner
    if curl -s http://localhost:5174 > /dev/null 2>&1; then
        echo "   ✅ ProjectPlanner is running on http://localhost:5174"
    else
        echo "   ❌ ProjectPlanner failed to start"
        return 1
    fi
    
    echo ""
    echo "🎉 Both servers are running successfully!"
    echo "   ConstructBMS: http://localhost:5173"
    echo "   ProjectPlanner: http://localhost:5174"
    echo ""
    echo "Press Ctrl+C to stop both servers"
}

# Main execution
main() {
    # Kill existing processes
    kill_port 5173
    kill_port 5174
    kill_processes
    
    # Clean up
    cleanup
    
    # Start servers
    start_constructbms
    start_projectplanner
    
    # Verify
    verify_servers
    
    # Wait for interrupt
    wait
}

# Handle cleanup on exit
cleanup_on_exit() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill_port 5173
    kill_port 5174
    kill_processes
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup_on_exit INT TERM

# Run main function
main
