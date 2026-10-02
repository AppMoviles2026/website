// Controls image fallback descriptions, the download notice and future video playback.
export function initMedia(config, i18n) {
  document.querySelectorAll("[data-media]").forEach(figure => {
    const image = figure.querySelector("img");
    const caption = figure.querySelector("figcaption, [data-media-caption]");

    function showImage() {
      image.hidden = false;
      caption.hidden = true;
    }

    function showDescription() {
      image.hidden = true;
      caption.hidden = false;
    }

    image.addEventListener("load", showImage);
    image.addEventListener("error", showDescription);
    if (image.complete) {
      if (image.naturalWidth > 0) showImage();
      else showDescription();
    } else {
      image.hidden = false;
      caption.hidden = true;
    }
  });

  const dialog = document.querySelector("#download-dialog");
  let playStoreUrl = null;
  try {
    if (config.playStoreUrl) {
      const url = new URL(config.playStoreUrl);
      if (url.protocol !== "https:" || url.hostname !== "play.google.com") {
        throw new Error("Invalid Google Play URL");
      }
      playStoreUrl = url.href;
    }
  } catch (error) {
    console.warn("The Google Play URL is invalid. The download notice remains available.");
  }

  document.querySelectorAll("[data-download]").forEach(link => {
    if (playStoreUrl) {
      link.href = playStoreUrl;
      return;
    }
    link.addEventListener("click", event => {
      event.preventDefault();
      dialog.showModal();
    });
  });
  document.querySelector("[data-dialog-contact]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  document.querySelectorAll("[data-video]").forEach(slot => {
    const kind = slot.dataset.video;
    const button = slot.querySelector("[data-play-video]");
    let videoUrl = null;
    try {
      if (config.videoUrls[kind]) {
        const url = new URL(config.videoUrls[kind]);
        const youtube = ["www.youtube-nocookie.com", "www.youtube.com", "youtube.com"].includes(url.hostname) && /^\/embed\/[\w-]+$/.test(url.pathname);
        const vimeo = url.hostname === "player.vimeo.com" && /^\/video\/\d+$/.test(url.pathname);
        if (url.protocol !== "https:" || (!youtube && !vimeo) || url.username || url.password) {
          throw new Error("Invalid video embed URL");
        }
        url.searchParams.delete("autoplay");
        videoUrl = url.href;
      }
    } catch (error) {
      console.warn(`The ${kind} video URL is invalid. The placeholder remains available.`);
    }
    if (!videoUrl) return;
    button.hidden = false;
    button.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = videoUrl;
      iframe.title = i18n.translate(`video.watch.${kind}`);
      iframe.allow = "fullscreen; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      slot.replaceChildren(iframe);
      i18n.subscribe(() => { iframe.title = i18n.translate(`video.watch.${kind}`); });
      iframe.focus();
    }, { once: true });
  });
}
