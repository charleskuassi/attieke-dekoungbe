$ports = 5000,5001,5173,5174
foreach ($p in $ports) {
    Write-Output "Checking port $p..."
    $out = netstat -a -n -o | findstr ":$p"
    if ($out) {
        $pids = ($out -split "\r?\n" | ForEach-Object { ($_ -split '\s+')[-1] }) | Select-Object -Unique
        foreach ($pid in $pids) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Output "Stopped PID $pid listening on port $p"
            } catch {
                Write-Output ("Could not stop PID {0}: {1}" -f $pid, $_)
            }
        }
    } else {
        Write-Output "No listener on port $p"
    }
}
