/**
 * 구글 로그인 시작. 카톡 인앱 브라우저(WebView)는 구글이 OAuth 를 막으므로
 * 외부 브라우저로 같은 주소를 연다. 던지는 사람은 로그인하지 않으니 이 경로를 타지 않는다.
 */
export function startGoogleLogin(next = '/') {
  const url = `${window.location.origin}/api/auth/google/start?next=${encodeURIComponent(next)}`
  if (/KAKAOTALK/i.test(navigator.userAgent)) {
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`
    return
  }
  window.location.href = url
}

export function isInAppBrowser() {
  return /KAKAOTALK|Instagram|FBAN|FBAV|Line\//i.test(navigator.userAgent)
}
