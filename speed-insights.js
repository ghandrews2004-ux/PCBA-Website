// Vercel Speed Insights
// This script injects Speed Insights tracking for the PCBA website
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Speed Insights
injectSpeedInsights({
  debug: false // Set to true for development debugging
});
