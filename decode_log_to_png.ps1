$logPath = "C:\Users\User\.gemini\antigravity\brain\73189a5f-0c51-4600-9c2c-f89be81ac88c\.system_generated\tasks\task-1349.log"
$outDir = "C:\Users\User\.gemini\antigravity\scratch\sergey-portfolio"

if (!(Test-Path $logPath)) {
    Write-Error "Log file not found: $logPath"
    Exit
}

$content = [System.IO.File]::ReadAllText($logPath)

$frameKeys = @("00", "10", "20")

foreach ($key in $frameKeys) {
    $startMarker = "===FRAME_${key}_START==="
    $endMarker = "===FRAME_${key}_END==="
    
    $startIdx = $content.IndexOf($startMarker)
    $endIdx = $content.IndexOf($endMarker)
    
    if ($startIdx -ge 0 -and $endIdx -gt $startIdx) {
        $base64Start = $startIdx + $startMarker.Length
        $base64Len = $endIdx - $base64Start
        $base64Text = $content.Substring($base64Start, $base64Len).Trim()
        
        # Remove any newlines/carriage returns
        $base64Text = $base64Text -replace "`r", ""
        $base64Text = $base64Text -replace "`n", ""
        
        $pngPath = Join-Path $outDir "frame_$key.png"
        if (Test-Path $pngPath) { Remove-Item $pngPath }
        
        $bytes = [System.Convert]::FromBase64String($base64Text)
        [System.IO.File]::WriteAllBytes($pngPath, $bytes)
        
        Write-Host "Successfully decoded frame_$key.png"
    } else {
        Write-Host "Marker not found for frame_$key"
    }
}
