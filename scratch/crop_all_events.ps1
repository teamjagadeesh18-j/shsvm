Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path "client\public\images\events-award.jpg"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$tiles = @(
  @{ name="event-1.jpg"; x=85;  y=30;  w=200; h=148 },
  @{ name="event-2.jpg"; x=310; y=30;  w=200; h=148 },
  @{ name="event-3.jpg"; x=535; y=30;  w=200; h=148 },
  @{ name="event-4.jpg"; x=760; y=30;  w=200; h=148 },
  @{ name="event-5.jpg"; x=85;  y=192; w=200; h=148 },
  @{ name="event-6.jpg"; x=310; y=192; w=200; h=148 },
  @{ name="event-7.jpg"; x=535; y=192; w=200; h=148 },
  @{ name="event-8.jpg"; x=760; y=192; w=200; h=148 }
)

$outDir = Resolve-Path "client\public\images"

foreach ($t in $tiles) {
  $rect = [System.Drawing.Rectangle]::new($t.x, $t.y, $t.w, $t.h)
  $cropped = $src.Clone($rect, $src.PixelFormat)
  $destPath = Join-Path $outDir $t.name
  $cropped.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $cropped.Dispose()
  Write-Host "Saved $($t.name)"
}

$src.Dispose()
Write-Host "All 8 event images successfully extracted!"

