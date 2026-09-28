$desktop = [Environment]::GetFolderPath('Desktop')
$wsh = New-Object -ComObject WScript.Shell
$shortcutPath = Join-Path $desktop "Luxe Dev.lnk"
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "c:\luxe\start_dev.bat"
$shortcut.WorkingDirectory = "c:\luxe"
$shortcut.IconLocation = "shell32.dll,137"
$shortcut.Description = "Run Luxe Frontend and Backend"
$shortcut.Save()

$batPath = Join-Path $desktop "Luxe Dev.bat"
Copy-Item "c:\luxe\start_dev.bat" $batPath -Force

Write-Host "Shortcut and BAT created successfully on Desktop!"
