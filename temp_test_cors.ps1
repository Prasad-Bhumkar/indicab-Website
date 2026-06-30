$uri = 'http://localhost:8000/actuator/health'
$headers = @{ Origin = 'http://localhost' }
try {
    $r = Invoke-WebRequest -Uri $uri -Headers $headers -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Output "STATUS: $($r.StatusCode)"
    Write-Output "HEADERS:"
    $r.Headers.GetEnumerator() | ForEach-Object { Write-Output "  $($_.Key): $($_.Value)" }
    Write-Output "BODY:"
    Write-Output $r.Content
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $resp = $_.Exception.Response
        Write-Output "STATUS: $($resp.StatusCode.value__)"
        Write-Output "HEADERS:"
        $resp.Headers.GetEnumerator() | ForEach-Object { Write-Output "  $($_.Key): $($_.Value)" }
        try { $reader = New-Object System.IO.StreamReader($resp.GetResponseStream()); Write-Output "BODY:"; Write-Output $reader.ReadToEnd(); } catch {}
    }
}
