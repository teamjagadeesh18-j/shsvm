Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path "client\public\images\events-award.jpg"))
Write-Host "Image Size: $($img.Width) x $($img.Height)"
$img.Dispose()

