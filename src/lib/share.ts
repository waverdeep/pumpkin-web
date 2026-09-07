/** 링크 뿌리기. 공유 시트가 있으면 그걸, 없으면 클립보드. 카톡 인앱은 대체로 공유 시트를 준다. */
export async function shareLink(url: string, title: string): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text: `${title} — 달콤한 마니또가 되어줘. 몰래 사탕 하나 넣고 가`, url })
      return 'shared'
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'failed'
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    // 클립보드 권한이 없는 인앱: 사용자가 직접 복사하도록 텍스트 선택에 맡긴다
    return 'failed'
  }
}
