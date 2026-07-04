export const VIDEO_PLATFORM_OPTIONS = [
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "microsoft_teams", label: "Microsoft Teams" },
  { value: "youtube_live", label: "YouTube Live" },
  { value: "twitch", label: "Twitch" },
  { value: "custom", label: "Custom / Other" },
] as const;

export function videoPlatformLabel(value: string | null | undefined): string {
  if (!value) return "Online";
  return VIDEO_PLATFORM_OPTIONS.find((p) => p.value === value)?.label ?? value;
}
