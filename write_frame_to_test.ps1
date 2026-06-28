# Load WPF types
[void][System.Reflection.Assembly]::LoadWithPartialName("PresentationCore")
[void][System.Reflection.Assembly]::LoadWithPartialName("PresentationFramework")
[void][System.Reflection.Assembly]::LoadWithPartialName("WindowsBase")
[void][System.Reflection.Assembly]::LoadWithPartialName("System.Xaml")

$code = @"
using System;
using System.IO;
using System.Threading;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;

public class FrameExtractor
{
    public static string GetFrameBase64(string videoPath, double t)
    {
        var player = new MediaPlayer();
        player.Volume = 0;
        player.ScrubbingEnabled = true;

        var openedEvent = new ManualResetEvent(false);
        player.MediaOpened += (s, e) => {
            openedEvent.Set();
            Dispatcher.CurrentDispatcher.BeginInvokeShutdown(DispatcherPriority.Normal);
        };

        player.Open(new Uri(videoPath));
        Dispatcher.Run();

        int width = player.NaturalVideoWidth;
        int height = player.NaturalVideoHeight;
        if (width <= 0 || height <= 0)
        {
            width = 720;
            height = 900;
        }

        player.Position = TimeSpan.FromSeconds(t);
        
        var timer = new DispatcherTimer();
        timer.Interval = TimeSpan.FromMilliseconds(500);
        timer.Tick += (s, e) => {
            timer.Stop();
            Dispatcher.CurrentDispatcher.BeginInvokeShutdown(DispatcherPriority.Normal);
        };
        timer.Start();
        Dispatcher.Run();

        var drawingVisual = new DrawingVisual();
        using (var drawingContext = drawingVisual.RenderOpen())
        {
            drawingContext.DrawVideo(player, new Rect(0, 0, width, height));
        }

        var renderTargetBitmap = new RenderTargetBitmap(width, height, 96, 96, PixelFormats.Pbgra32);
        renderTargetBitmap.Render(drawingVisual);

        var encoder = new PngBitmapEncoder();
        encoder.Frames.Add(BitmapFrame.Create(renderTargetBitmap));

        using (var ms = new MemoryStream())
        {
            encoder.Save(ms);
            byte[] bytes = ms.ToArray();
            return Convert.ToBase64String(bytes);
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies PresentationCore, PresentationFramework, WindowsBase, System.Xaml

$videoPath = "C:\Users\User\.gemini\antigravity\brain\73189a5f-0c51-4600-9c2c-f89be81ac88c\pinterest_video.mp4"

Write-Host "Extracting frame 0.0s..."
$base64_00 = [FrameExtractor]::GetFrameBase64($videoPath, 0.0)

Write-Host "Extracting frame 1.0s..."
$base64_10 = [FrameExtractor]::GetFrameBase64($videoPath, 1.0)

Write-Host "Extracting frame 2.0s..."
$base64_20 = [FrameExtractor]::GetFrameBase64($videoPath, 2.0)

# Write to test_write.txt as a single merged file with format:
# [FRAME_00]
# base64_00
# [FRAME_10]
# base64_10
# [FRAME_20]
# base64_20
$merged = "[FRAME_00]`r`n" + $base64_00 + "`r`n[FRAME_10]`r`n" + $base64_10 + "`r`n[FRAME_20]`r`n" + $base64_20
Set-Content -Path "C:\Users\User\.gemini\antigravity\scratch\sergey-portfolio\test_write.txt" -Value $merged

Write-Host "Completed writing to test_write.txt! Total length: $($merged.Length)"
