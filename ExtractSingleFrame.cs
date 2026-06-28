using System;
using System.IO;
using System.Threading;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;

class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        if (args.Length < 2)
        {
            Console.WriteLine("Usage: ExtractSingleFrame.exe <videoPath> <time>");
            return;
        }

        string videoPath = args[0];
        double t = double.Parse(args[1], System.Globalization.CultureInfo.InvariantCulture);

        var player = new MediaPlayer();
        player.Volume = 0;
        player.ScrubbingEnabled = true;

        player.MediaOpened += (s, e) => {
            Dispatcher.CurrentDispatcher.BeginInvokeShutdown(DispatcherPriority.Normal);
        };

        player.Open(new Uri(videoPath));
        Dispatcher.Run();

        // Resize output to 360x450 (which is 1/4 the area of 720x900) to keep base64 sizes small
        int width = 360;
        int height = 450;

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
            string base64 = Convert.ToBase64String(bytes);
            
            string outDir = Path.GetDirectoryName(videoPath);
            if (string.IsNullOrEmpty(outDir)) outDir = Directory.GetCurrentDirectory();
            
            string timeStr = (t * 10).ToString("00", System.Globalization.CultureInfo.InvariantCulture);
            string outPath = Path.Combine(outDir, "frame_" + timeStr + ".txt");
            File.WriteAllText(outPath, base64);
            Console.WriteLine("Successfully extracted and wrote resized: " + outPath);
        }

        player.Close();
    }
}
