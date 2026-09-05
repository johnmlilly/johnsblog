declare namespace Cloudflare {
  interface Env {
    RESEND_API_KEY: string;
  }
}

interface Env extends Cloudflare.Env {}
