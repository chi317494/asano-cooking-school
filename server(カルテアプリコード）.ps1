$port = 8080
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host ""
Write-Host "==========================="
Write-Host " Server started!"
Write-Host " http://localhost:8080/student-karte.html"
Write-Host "==========================="
Write-Host " Close this window to stop."
Write-Host ""

Start-Process "http://localhost:$port/student-karte.html"

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $reqPath = $ctx.Request.Url.LocalPath

    # Proxy: /proxy -> Anthropic API
    if ($reqPath -eq '/proxy') {
        try {
            $reader = [System.IO.StreamReader]::new($ctx.Request.InputStream, [System.Text.Encoding]::UTF8)
            $body = $reader.ReadToEnd()
            $reader.Close()

            # ヘッダーのキー優先、なければ環境変数（Claude Code）を使用
            $apiKey = $ctx.Request.Headers['X-Proxy-Api-Key']
            if (-not $apiKey) { $apiKey = $env:ANTHROPIC_API_KEY }
            if (-not $apiKey) {
                $errJson = '{"error":{"message":"APIキーが見つかりません。設定画面で入力してください。"}}'
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($errJson)
                $ctx.Response.StatusCode = 401
                $ctx.Response.ContentType = 'application/json'
                $ctx.Response.Headers.Add('Access-Control-Allow-Origin', '*')
                $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
                $ctx.Response.Close()
                continue
            }

            $web = [System.Net.WebClient]::new()
            $web.Headers.Add('Content-Type', 'application/json')
            $web.Headers.Add('x-api-key', $apiKey)
            $web.Headers.Add('anthropic-version', '2023-06-01')
            $response = $web.UploadString('https://api.anthropic.com/v1/messages', $body)

            $bytes = [System.Text.Encoding]::UTF8.GetBytes($response)
            $ctx.Response.ContentType = 'application/json'
            $ctx.Response.Headers.Add('Access-Control-Allow-Origin', '*')
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } catch {
            $webEx = $_.Exception -as [System.Net.WebException]
            if ($webEx -and $webEx.Response) {
                $errReader = [System.IO.StreamReader]::new($webEx.Response.GetResponseStream())
                $errBody = $errReader.ReadToEnd()
                $errReader.Close()
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($errBody)
                $ctx.Response.StatusCode = 400
            } else {
                $errJson = @{error=@{message=$_.Exception.Message}} | ConvertTo-Json
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($errJson)
                $ctx.Response.StatusCode = 500
            }
            $ctx.Response.ContentType = 'application/json'
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $ctx.Response.Close()
        continue
    }

    # OPTIONS preflight
    if ($ctx.Request.HttpMethod -eq 'OPTIONS') {
        $ctx.Response.Headers.Add('Access-Control-Allow-Origin', '*')
        $ctx.Response.Headers.Add('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        $ctx.Response.Headers.Add('Access-Control-Allow-Headers', '*')
        $ctx.Response.Close()
        continue
    }

    # Static files
    $file = $reqPath.TrimStart('/')
    if (-not $file) { $file = 'student-karte.html' }
    $path = Join-Path $dir $file

    if (Test-Path $path) {
        $data = [IO.File]::ReadAllBytes($path)
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        $ct = switch ($ext) {
            '.html' { 'text/html; charset=utf-8' }
            '.js'   { 'application/javascript' }
            '.css'  { 'text/css' }
            default { 'application/octet-stream' }
        }
        $ctx.Response.ContentType = $ct
        $ctx.Response.OutputStream.Write($data, 0, $data.Length)
    } else {
        $ctx.Response.StatusCode = 404
    }
    $ctx.Response.Close()
}
