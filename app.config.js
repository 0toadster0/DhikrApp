/**
 * Keep app.json as the source of truth; strip expo-router `origin` locally so
 * dev URLs are not tied to Replit. When Replit sets both REPLIT_* dev domains,
 * preserve the origin from app.json (via merged `config`).
 */
module.exports = ({ config }) => {
  const onReplit =
    Boolean(process.env.REPLIT_EXPO_DEV_DOMAIN && process.env.REPLIT_DEV_DOMAIN);

  const plugins = (config.plugins || []).map((p) => {
    if (Array.isArray(p) && p[0] === "expo-router") {
      const [, options = {}] = p;
      if (onReplit) {
        return ["expo-router", options];
      }
      const rest = { ...options };
      delete rest.origin;
      return Object.keys(rest).length > 0 ? ["expo-router", rest] : "expo-router";
    }
    return p;
  });

  return {
    ...config,
    plugins,
  };
};
