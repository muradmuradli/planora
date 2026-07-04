export const CATEGORY_OPTIONS = [
  { value: "technology", label: "Technology" },
  { value: "music", label: "Music" },
  { value: "food_drink", label: "Food & Drink" },
  { value: "business", label: "Business" },
  { value: "wellness", label: "Wellness" },
  { value: "arts_culture", label: "Arts & Culture" },
  { value: "sports", label: "Sports" },
] as const;

export function categoryLabel(value: string): string {
  return CATEGORY_OPTIONS.find((c) => c.value === value)?.label ?? value;
}
