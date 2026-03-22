import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  imageOptimization: {
    format: "none",
  },
});
