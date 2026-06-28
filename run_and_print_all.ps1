$videoSrc = "C:\Users\User\.gemini\antigravity\brain\73189a5f-0c51-4600-9c2c-f89be81ac88c\pinterest_video.mp4"
$videoPath = "C:\Users\User\.gemini\antigravity\scratch\sergey-portfolio\pinterest_video.mp4"
$exePath = "C:\Users\User\.gemini\antigravity\scratch\sergey-portfolio\ExtractSingleFrameV2.exe"
$outDir = "C:\Users\User\.gemini\antigravity\scratch\sergey-portfolio"

# Ensure video exists in workspace
if (!(Test-Path $videoPath)) {
    Copy-Item $videoSrc $videoPath
}

$times = @(0.0, 1.0, 2.0)

foreach ($t in $times) {
    $timeStr = ($t * 10).ToString("00", [System.Globalization.CultureInfo]::InvariantCulture)
    $txtPath = Join-Path $outDir "frame_$timeStr.txt"
    
    if (Test-Path $txtPath) { Remove-Item $txtPath }
    
    Write-Host "Running extractor for $t s..."
    $proc = Start-Process -FilePath $exePath -ArgumentList "`"$videoPath`"", $t.ToString([System.Globalization.CultureInfo]::InvariantCulture) -PassThru -NoNewWindow -Wait
    
    if (Test-Path $txtPath) {
        $base64 = [System.IO.File]::ReadAllText($txtPath)
        Write-Host "===FRAME_${timeStr}_START==="
        Write-Host $base64
        Write-Host "===FRAME_${timeStr}_END==="
        Remove-Item $txtPath
    } else {
        Write-Host "Failed to extract for $t s"
    }
}

if (Test-Path $videoPath) { Remove-Item $videoPath }
Write-Host "Done!"
