<#
.SYNOPSIS
  一键把 .env.local 中的环境变量写入 Vercel 项目。
.DESCRIPTION
  首次使用需要先在浏览器完成一次 Vercel 登录：
      npx vercel login
  然后运行：
      powershell -ExecutionPolicy Bypass -File .\scripts\setup-vercel-env.ps1
  可选参数：
      -Project mybandori_site
      -SiteUrl https://mybandori.icu
      -Environments production,preview,development
      -Scope <team-slug>
      -Login          未登录时自动打开浏览器登录
      -DryRun         只打印将要执行的命令，不真正写入
#>
[CmdletBinding()]
param(
  [string]$Project = 'mybandori_site',
  [string]$Scope = '',
  [string]$SiteUrl = 'https://mybandori.icu',
  [string[]]$Environments = @('production', 'preview', 'development'),
  [switch]$Login,
  [switch]$DryRun
)

$ErrorActionPreference = 'Continue'

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "== $Message" -ForegroundColor Cyan
}

$Root = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $Root '.env.local'
if (-not (Test-Path $EnvFile)) {
  throw "找不到 .env.local：$EnvFile"
}

# ---------- 读取 .env.local ----------
$vars = [ordered]@{}
foreach ($line in Get-Content $EnvFile -Encoding UTF8) {
  $text = $line.Trim()
  if (-not $text -or $text.StartsWith('#')) { continue }
  $eq = $text.IndexOf('=')
  if ($eq -lt 1) { continue }
  $key = $text.Substring(0, $eq).Trim()
  $value = $text.Substring($eq + 1).Trim()
  if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
    $value = $value.Substring(1, $value.Length - 2)
  }
  $vars[$key] = $value
}

$wanted = @(
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OWNER_PASSWORD',
  'AUTH_SECRET'
)

if ($SiteUrl) { $vars['NEXT_PUBLIC_SITE_URL'] = $SiteUrl }

$selected = [ordered]@{}
foreach ($key in $wanted) {
  if (-not $vars.Contains($key)) { continue }
  $value = [string]$vars[$key]
  if ($value -match '^(REPLACE_WITH|CHANGE_ME|your-)') {
    Write-Host "跳过占位符：$key" -ForegroundColor Yellow
    continue
  }
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Host "跳过空值：$key" -ForegroundColor Yellow
    continue
  }
  $selected[$key] = $value
}

if ($selected.Count -eq 0) {
  throw '.env.local 中没有可写入的变量。'
}

Write-Step "准备写入 $($selected.Count) 个变量到项目 $Project（环境：$($Environments -join ', ')）"
foreach ($key in $selected.Keys) {
  Write-Host ("  - {0}（{1} 字符）" -f $key, $selected[$key].Length)
}

# ---------- 定位 Vercel CLI ----------
$script:VercelPrefix = $null
if (Get-Command vercel -ErrorAction SilentlyContinue) {
  $script:VercelPrefix = @('vercel')
} elseif (Get-Command npx -ErrorAction SilentlyContinue) {
  $script:VercelPrefix = @('npx', '--yes', 'vercel@latest')
} else {
  $node = $null
  $nodeCandidates = @(
    (Join-Path $env:USERPROFILE '.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'),
    'C:\Users\Administrator\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe'
  )
  foreach ($candidate in $nodeCandidates) {
    if (Test-Path $candidate) { $node = $candidate; break }
  }
  $pnpm = $null
  $pnpmCandidates = @(
    (Join-Path $env:USERPROFILE '.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs'),
    'C:\Users\Administrator\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs'
  )
  foreach ($candidate in $pnpmCandidates) {
    if (Test-Path $candidate) { $pnpm = $candidate; break }
  }
  if ($node -and $pnpm) {
    $nodeDir = Split-Path -Parent $node
    if ($env:PATH -notlike "*$nodeDir*") { $env:PATH = "$nodeDir;$env:PATH" }
    $script:VercelPrefix = @($node, $pnpm, 'dlx', 'vercel@latest')
  } else {
    throw '未找到 Node.js / npx。请先安装 Node.js LTS（https://nodejs.org/），或改用 Vercel 网页手动添加。'
  }
}
Write-Host ("使用命令：" + ($script:VercelPrefix -join ' '))

function Invoke-Vercel {
  param([string[]]$Arguments)
  $exe = $script:VercelPrefix[0]
  $prefixArgs = @()
  if ($script:VercelPrefix.Count -gt 1) {
    $prefixArgs = $script:VercelPrefix[1..($script:VercelPrefix.Count - 1)]
  }
  & $exe @prefixArgs @Arguments
}

# ---------- DryRun ----------
if ($DryRun) {
  Write-Step 'DryRun：只打印命令，不调用 Vercel'
  foreach ($key in $selected.Keys) {
    Write-Host ("  vercel env add {0} --value *** --environment {1} --force --yes --project {2}" -f $key, ($Environments -join ','), $Project)
  }
  return
}

# ---------- 登录检查 ----------
Write-Step '检查 Vercel 登录状态'
$who = Invoke-Vercel @('whoami') 2>&1
$whoExit = $LASTEXITCODE
if ($whoExit -ne 0) {
  if ($Login) {
    Write-Host '未登录，正在打开浏览器授权…' -ForegroundColor Yellow
    Invoke-Vercel @('login')
    $who = Invoke-Vercel @('whoami') 2>&1
    $whoExit = $LASTEXITCODE
  }
  if ($whoExit -ne 0) {
    Write-Host '未登录。请先运行：npx vercel login（或 vercel login），完成浏览器授权后再运行本脚本。' -ForegroundColor Red
    exit 1
  }
}
Write-Host ("已登录：" + (($who | Out-String).Trim()))

# ---------- 关联项目 ----------
$linkFile = Join-Path $Root '.vercel\project.json'
if (-not (Test-Path $linkFile)) {
  Write-Step "关联项目 $Project"
  $linkArgs = @('link', '--yes', '--project', $Project)
  if ($Scope) { $linkArgs += @('--scope', $Scope) }
  Invoke-Vercel $linkArgs
  if ($LASTEXITCODE -ne 0) {
    throw "关联项目失败。请确认项目 $Project 已在 Vercel 创建，且当前账号有权限。"
  }
}

# ---------- 写入变量 ----------
$failed = @()
foreach ($key in $selected.Keys) {
  Write-Step "写入 $key"
  $cliArgs = @(
    'env', 'add', $key,
    '--value', $selected[$key],
    '--environment', ($Environments -join ','),
    '--force', '--yes',
    '--project', $Project
  )
  if ($Scope) { $cliArgs += @('--scope', $Scope) }
  Invoke-Vercel $cliArgs
  $writeExit = $LASTEXITCODE
  if ($writeExit -ne 0) { $failed += $key }
}

Write-Step '完成'
if ($failed.Count -gt 0) {
  Write-Host ("以下变量写入失败：" + ($failed -join ', ')) -ForegroundColor Red
  exit 1
}

Write-Host '全部变量已写入。' -ForegroundColor Green
Write-Host '请到 Vercel → Deployments → 最新部署 → ⋯ → Redeploy，让变量生效。' -ForegroundColor Green
Write-Host ''
Invoke-Vercel @('env', 'ls', '--project', $Project) 2>&1 | Out-String | Write-Host
