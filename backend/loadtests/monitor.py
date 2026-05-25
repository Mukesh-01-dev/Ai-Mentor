import os
import sys
import time
import csv
import psutil
# Try importing matplotlib to plot live/post-test graphs.
# If not installed, we fallback to printing data and saving the CSV.
try:
    import matplotlib.pyplot as plt
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False
def find_node_process(port=5000):
    """
    Finds the Node.js backend server process.
    First tries to scan connections on port 5000, 
    then scans command lines for 'server.js'.
    """
    # Attempt 1: Scan connections for port 5000
    try:
        for conn in psutil.net_connections(kind='inet'):
            if conn.laddr.port == port and conn.status == 'LISTEN':
                try:
                    proc = psutil.Process(conn.pid)
                    if 'node' in proc.name().lower():
                        return proc
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
    except Exception:
        # psutil.net_connections might fail without admin permissions on some setups
        pass
    # Attempt 2: Search command lines for 'server.js'
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            name = proc.info['name'] or ''
            cmdline = proc.info['cmdline'] or []
            cmd_str = ' '.join(cmdline).lower()
            if 'node' in name.lower() and ('server.js' in cmd_str or 'nodemon' in cmd_str):
                return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    # Attempt 3: General fallback - any active node process
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            name = proc.info['name'] or ''
            if 'node' in name.lower():
                return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
            
    return None
def main():
    print("=" * 60)
    print("      UPTOSKILLS BACKEND RESOURCE MONITOR")
    print("=" * 60)
    print("Searching for running Node.js backend process...")
    
    target_process = find_node_process()
    if not target_process:
        print("❌ Error: Running Node.js backend process not found.")
        print("Please start the backend server first (e.g., 'npm run dev' or 'node server.js').")
        sys.exit(1)
        
    print(f"✅ Found backend process! PID: {target_process.pid}, Name: {target_process.name()}")
    print("Resource monitoring started. Press Ctrl+C to stop and generate charts.")
    print("-" * 60)
    
    csv_file = 'resource_log.csv'
    timestamps = []
    cpu_usages = []
    mem_usages = []
    net_sent_usages = []
    net_recv_usages = []
    
    # Initialize network I/O counters
    net_io_before = psutil.net_io_counters()
    prev_bytes_sent = net_io_before.bytes_sent
    prev_bytes_recv = net_io_before.bytes_recv
    # Initialize CPU measurement (needs a baseline check)
    target_process.cpu_percent(interval=None)
    time.sleep(0.5)
    
    start_time = time.time()
    
    try:
        with open(csv_file, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Elapsed_Seconds', 'CPU_Percent', 'Memory_MB', 'Net_Sent_KB_s', 'Net_Recv_KB_s'])
            
            print(f"{'Elapsed (s)':<12}{'CPU (%)':<12}{'Memory (MB)':<15}{'Net Sent (KB/s)':<18}{'Net Recv (KB/s)':<18}")
            print("-" * 75)
            
            while True:
                elapsed = int(time.time() - start_time)
                try:
                    # Get CPU %
                    cpu = target_process.cpu_percent(interval=None)
                    
                    # Get RSS Memory in MB
                    mem_info = target_process.memory_info()
                    mem_mb = mem_info.rss / (1024 * 1024)
                    
                    # Get Network I/O difference
                    net_io_now = psutil.net_io_counters()
                    bytes_sent_diff = net_io_now.bytes_sent - prev_bytes_sent
                    bytes_recv_diff = net_io_now.bytes_recv - prev_bytes_recv
                    
                    # Update previous values
                    prev_bytes_sent = net_io_now.bytes_sent
                    prev_bytes_recv = net_io_now.bytes_recv
                    
                    # Convert bytes to KB
                    net_sent_kb = bytes_sent_diff / 1024.0
                    net_recv_kb = bytes_recv_diff / 1024.0
                    
                    timestamps.append(elapsed)
                    cpu_usages.append(cpu)
                    mem_usages.append(mem_mb)
                    net_sent_usages.append(net_sent_kb)
                    net_recv_usages.append(net_recv_kb)
                    
                    writer.writerow([
                        elapsed, 
                        round(cpu, 2), 
                        round(mem_mb, 2), 
                        round(net_sent_kb, 2), 
                        round(net_recv_kb, 2)
                    ])
                    file.flush() # Force write to disk
                    
                    print(f"{elapsed:<12}{cpu:<12.2f}{mem_mb:<15.2f}{net_sent_kb:<18.2f}{net_recv_kb:<18.2f}")
                    
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    print("\n⚠️ Node.js server process terminated unexpectedly.")
                    break
                    
                time.sleep(1)
                
    except KeyboardInterrupt:
        print("\nMonitoring stopped by user.")
        
    print("-" * 75)
    print(f"Data saved to '{csv_file}'")
    
    if HAS_MATPLOTLIB and len(timestamps) > 1:
        print("Generating charts...")
        fig, (ax_res, ax_net) = plt.subplots(2, 1, figsize=(10, 8), sharex=True)
        # 1. CPU & Memory Subplot (Top)
        color_cpu = 'tab:red'
        ax_res.set_ylabel('CPU Usage (%)', color=color_cpu)
        ax_res.plot(timestamps, cpu_usages, color=color_cpu, label='CPU %', linewidth=2)
        ax_res.tick_params(axis='y', labelcolor=color_cpu)
        ax_res.set_ylim(0, max(cpu_usages) * 1.2 if max(cpu_usages) > 0 else 100)
        ax_res.grid(True, linestyle='--', alpha=0.5)
        ax_mem = ax_res.twinx()  
        color_mem = 'tab:blue'
        ax_mem.set_ylabel('Memory (MB)', color=color_mem)
        ax_mem.plot(timestamps, mem_usages, color=color_mem, label='Memory (MB)', linewidth=2)
        ax_mem.tick_params(axis='y', labelcolor=color_mem)
        ax_mem.set_ylim(0, max(mem_usages) * 1.2 if max(mem_usages) > 0 else 256)
        ax_res.set_title('Node.js Backend CPU & Memory Utilization', fontweight='bold')
        # 2. Network I/O Subplot (Bottom)
        ax_net.plot(timestamps, net_sent_usages, color='tab:orange', label='Sent (KB/s)', linestyle='-', linewidth=2)
        ax_net.plot(timestamps, net_recv_usages, color='tab:green', label='Received (KB/s)', linestyle='--', linewidth=2)
        ax_net.set_xlabel('Time (seconds)')
        ax_net.set_ylabel('Throughput (KB/s)')
        ax_net.set_title('Network I/O Throughput', fontweight='bold')
        ax_net.legend(loc='upper right')
        ax_net.grid(True, linestyle='--', alpha=0.5)
        
        max_net = max(max(net_sent_usages), max(net_recv_usages))
        ax_net.set_ylim(0, max_net * 1.2 if max_net > 0 else 100)
        plt.suptitle('Backend Server System Metrics (Load Test Profile)', fontsize=14, fontweight='bold')
        fig.tight_layout()  
        
        chart_file = 'resource_chart.png'
        plt.savefig(chart_file)
        print(f"📈 Dual-panel chart saved to '{chart_file}'")
    else:
        if not HAS_MATPLOTLIB:
            print("💡 Install 'matplotlib' (pip install matplotlib) to automatically generate visual PNG charts next time.")
            
    print("=" * 75)
if __name__ == '__main__':
    main()
