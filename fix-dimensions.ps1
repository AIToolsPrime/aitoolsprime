$files = Get-ChildItem -Path "." -Recurse -Filter "*.html"
foreach ($f in $files) {
  $content = Get-Content $f.FullName
  for ($i = 0; $i -lt $content.Count; $i++) {
    if ($content[$i] -match '(og:image.*\.png")$' -and $content[$i] -notmatch '>$') {
      $content[$i] = $content[$i] + '>'
    }
    if ($content[$i] -match '(og:image:height.*630")>$') {
      $content[$i] = $content[$i] -replace '>$', '>'
    }
  }
  Set-Content $f.FullName $content
}
Write-Output "Done: $($files.Count) files"
