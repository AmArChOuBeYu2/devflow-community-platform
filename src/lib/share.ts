// Robust cross-platform Web Share & Clipboard helper
// DevFlow Community Platform

export interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

export interface ShareResult {
  success: boolean;
  method: "native" | "clipboard" | "fallback" | "cancelled" | "failed";
  message: string;
}

/**
 * Shares content using the native Web Share API (mobile/modern browsers),
 * falling back to the Clipboard API, and finally to an invisible textarea copy.
 * Gracefully handles user cancellations (AbortError) without counting them as errors or fake successes.
 */
export async function shareContent(options: ShareOptions): Promise<ShareResult> {
  const { title, text, url } = options;
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  // 1. Try native Web Share API (mobile devices / modern browsers)
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title,
        text: text || title,
        url: shareUrl,
      });
      return {
        success: true,
        method: "native",
        message: "Shared successfully!",
      };
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === "AbortError" || err.message?.toLowerCase().includes("abort"))) {
        return {
          success: false,
          method: "cancelled",
          message: "Share cancelled.",
        };
      }
      // If native share failed for reasons other than user abort, proceed to clipboard fallbacks
    }
  }

  // 2. Try Clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return {
        success: true,
        method: "clipboard",
        message: "Link copied to clipboard!",
      };
    } catch {
      // Permission denied or insecure context, proceed to textarea fallback
    }
  }

  // 3. Fallback textarea copy
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (copied) {
        return {
          success: true,
          method: "fallback",
          message: "Link copied to clipboard!",
        };
      }
    } catch {
      // Fallback failed
    }
  }

  return {
    success: false,
    method: "failed",
    message: "Unable to copy automatically. Please copy the link from your browser address bar.",
  };
}
