$projectRoot = $PSScriptRoot
$targetPath = Join-Path $projectRoot "index.html"

$desktops = @(
    "$env:USERPROFILE\OneDrive - Corporación Santo Tomas\Escritorio",
    "$env:USERPROFILE\Escritorio"
)

$wshShell = New-Object -ComObject WScript.Shell

foreach ($d in $desktops) {
    if (Test-Path $d) {
        $shortcutLocation = Join-Path $d "KineGait - Evaluacion Marcha.lnk"
        $shortcut = $wshShell.CreateShortcut($shortcutLocation)
        $shortcut.TargetPath = $targetPath
        $shortcut.WorkingDirectory = $projectRoot
        $shortcut.WindowStyle = 1
        $shortcut.Save()
        Write-Host "Acceso directo creado en: $shortcutLocation"
    }
}
