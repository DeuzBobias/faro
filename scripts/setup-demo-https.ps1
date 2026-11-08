param([Parameter(Mandatory=$true)][string]$Address)
$ErrorActionPreference = 'Stop'
$parsed = $null
if (-not [System.Net.IPAddress]::TryParse($Address, [ref]$parsed) -or $parsed.AddressFamily -ne 'InterNetwork') { throw 'Provide the laptop IPv4 Wi-Fi address.' }
Set-Location (Split-Path $PSScriptRoot -Parent)
$mkcert = Get-Command mkcert -ErrorAction SilentlyContinue
if ($mkcert) { $exe = $mkcert.Source } else {
 $exe = Join-Path $env:USERPROFILE 'AppData\Local\Microsoft\WinGet\Packages\FiloSottile.mkcert_Microsoft.Winget.Source_8wekyb3d8bbwe\mkcert.exe'
}
if (-not (Test-Path -LiteralPath $exe)) { throw 'Install mkcert first: winget install --id FiloSottile.mkcert --exact' }
$folder = Join-Path (Get-Location) '.local\https'
New-Item -ItemType Directory -Path $folder -Force | Out-Null
$previous = $env:CAROOT
try {
 $env:CAROOT = Join-Path $folder 'ca'
 & $exe -cert-file (Join-Path $folder 'cert.pem') -key-file (Join-Path $folder 'key.pem') localhost 127.0.0.1 $Address
 if ($LASTEXITCODE -ne 0) { throw 'Certificate generation failed.' }
 Copy-Item -LiteralPath (Join-Path $env:CAROOT 'rootCA.pem') -Destination (Join-Path $folder 'FARO-demo-CA.crt')
 Write-Output "Certificate created for https://${Address}:8446. No trust settings were changed."
 Write-Output "Only transfer FARO-demo-CA.crt to your phone. Never share key.pem or rootCA-key.pem."
} finally { $env:CAROOT = $previous }
