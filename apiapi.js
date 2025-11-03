/*
  song.js - Neocities JS API for SoundCloud track info (improved)
  Usage 1 (query-string): <script src="song.js?track_url=TRACK_URL&size=big"></script>
    -> sets global `SC_SONG`

  Usage 2 (programmatic): include script without params, then call:
    await SC_SONG_API.fetch('https://soundcloud.com/artist/track', 'big')
    -> returns object and sets window.SC_SONG

  Note: uses SoundCloud oEmbed (client-id free). Direct mp3 / download not available.
*/

(function(){
  async function fetchTrackInfo(track_url, size = 'big') {
    if (!track_url) throw new Error('track_url missing');
    const oembed_url = 'https://soundcloud.com/oembed?format=json&url=' + encodeURIComponent(track_url);
    const res = await fetch(oembed_url);
    if (!res.ok) throw new Error('Failed to fetch metadata: ' + res.status);
    const data = await res.json();

    // friendly artwork sizing
    let artwork = data.thumbnail_url || '';
    if (artwork) {
      if (size === 'big') artwork = artwork.replace('-large', '-t500x500');
      else if (size === 'small') artwork = artwork.replace('-large', '-t200x200');
    }

    return {
      ok: true,
      title: data.title || null,
      artist: data.author_name || null,
      artwork,
      embed_html: data.html || null,
      url: track_url,
      stream_url: null,
      download_url: null,
      downloadable: false
    };
  }

  // expose programmatic API
  window.SC_SONG_API = {
    /**
     * Fetch a track by URL. Returns the same object that will also be placed in window.SC_SONG.
     * @param {string} trackUrl - full SoundCloud track URL
     * @param {string} size - 'big'|'small'
     * @returns {Promise<Object>}
     */
    fetch: async function(trackUrl, size = 'big') {
      try {
        const info = await fetchTrackInfo(trackUrl, size);
        window.SC_SONG = info;
        return info;
      } catch (err) {
        const errObj = { ok: false, error: err.message || String(err) };
        window.SC_SONG = errObj;
        return errObj;
      }
    }
  };

  // If script loaded with ?track_url=..., auto-fetch and set SC_SONG
  (async function autoFetchFromQuery(){
    try {
      const params = new URLSearchParams(location.search);
      const track_url = params.get('track_url');
      const size = params.get('size') || 'big';
      if (!track_url) {
        // Be friendly: set SC_SONG to null (no error) and keep API available
        window.SC_SONG = null;
        return;
      }
      // perform fetch
      window.SC_SONG = { ok: false, loading: true };
      const info = await fetchTrackInfo(track_url, size);
      window.SC_SONG = info;
    } catch (err) {
      window.SC_SONG = { ok: false, error: err.message || String(err) };
      console.error('SC_SONG error:', err);
    }
  })();
})();
