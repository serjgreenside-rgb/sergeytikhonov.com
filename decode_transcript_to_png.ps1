$transcriptPath = "C:\Users\User\.gemini\antigravity\brain\73189a5f-0c51-4600-9c2c-f89be81ac88c\.system_generated\logs\transcript_full.jsonl"
$outDir = "C:\Users\User\.gemini\antigravity\scratch\sergey-portfolio"

if (!(Test-Path $transcriptPath)) {
    Write-Error "Transcript file not found: $transcriptPath"
    Exit
}

# Read lines from bottom to top for efficiency
$lines = [System.IO.File]::ReadLines($transcriptPath)
$targetLine = $null

foreach ($line in $lines) {
    if ($line.Contains("task-1349") -and $line.Contains("===FRAME_00_START===")) {
        $targetLine = $line
    }
}

if ($null -eq $targetLine) {
    Write-Error "Could not find task-1349 line in transcript!"
    Exit
}

Write-Host "Found target line in transcript. Parsing frames..."

$frameKeys = @("00", "10", "20")

foreach ($key in $frameKeys) {
    $startMarker = "===FRAME_${key}_START==="
    $endMarker = "===FRAME_${key}_END==="
    
    # In JSON, newlines inside strings are escaped as \r\n or \n
    # Let's find the start and end index of the markers
    $startIdx = $targetLine.IndexOf($startMarker)
    $endIdx = $targetLine.IndexOf($endMarker)
    
    if ($startIdx -ge 0 -and $endIdx -gt $startIdx) {
        $base64Start = $startIdx + $startMarker.Length
        $base64Len = $endIdx - $base64Start
        $base64Text = $targetLine.Substring($base64Start, $base64Len).Trim()
        
        # Clean up any JSON escaped sequences and newlines
        $base64Text = $base64Text -replace "\\r", ""
        $base64Text = $base64Text -replace "\\n", ""
        $base64Text = $base64Text -replace "`r", ""
        $base64Text = $base64Text -replace "`n", ""
        $base64Text = $base64Text -replace "\\/", "/"
        
        # Clean up any potential double quotes or backslashes at boundaries
        $base64Text = $base64Text.Trim('"', '\', ' ')
        
        $pngPath = Join-Path $outDir "frame_$key.png"
        if (Test-Path $pngPath) { Remove-Item $pngPath }
        
        $bytes = [System.Convert]::FromBase64String($base64Text)
        [System.IO.File]::WriteAllBytes($pngPath, $bytes)
        
        Write-Host "Successfully decoded frame_$key.png to workspace"
    } else {
        Write-Host "Marker not found for frame_$key"
    }
}
