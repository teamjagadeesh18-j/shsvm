Add-Type -AssemblyName System.Drawing

$srcPath = Resolve-Path "client\public\images\events-award.jpg"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$tiles = @(
  @{ name="event-1.jpg"; x=166; y=34;  w=208; h=156 },
  @{ name="event-2.jpg"; x=390; y=34;  w=208; h=156 },
  @{ name="event-3.jpg"; x=614; y=34;  w=208; h=156 },
  @{ name="event-4.jpg"; x=237; y=210; w=208; h=156 },
  @{ name="event-5.jpg"; x=461; y=210; w=208; h=156 },
  @{ name="event-6.jpg"; x=685; y=210; w=208; h=156 }
)

$outDir = Resolve-Path "client\public\images"

foreach ($t in $tiles) {
  $rect = [System.Drawing.Rectangle]::new($t.x, $t.y, $t.w, $t.h)
  $cropped = $src.Clone($rect, $src.PixelFormat)
  $destPath = Join-Path $outDir $t.name
  $cropped.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $cropped.Dispose()
  Write-Host "Cleanly extracted $($t.name)"
}

$src.Dispose()
Write-Host "6 clean 4:3 event photos successfully extracted without borders or blur!"
