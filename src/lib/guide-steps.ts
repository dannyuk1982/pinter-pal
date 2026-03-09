export interface GuideStep {
  title: string;
  description: string;
  tips: string[];
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    title: "Sanitise Everything",
    description:
      "Clean and sanitise your Pinter, lid, and any equipment that will touch the brew. Use a no-rinse sanitiser like Star San or the Pinter cleaning solution.",
    tips: [
      "Fill the Pinter with sanitiser solution and let it sit for 2 minutes",
      "Don't forget to sanitise the lid seal and any spoons or jugs",
      "No-rinse sanitiser is fine — just shake out excess",
    ],
  },
  {
    title: "Prepare Ingredients",
    description:
      "Open your homebrew kit and prepare the malt extract. Since you're splitting a larger kit for Pinter-sized batches, measure out half the ingredients for a 10-pint batch.",
    tips: [
      "Stand the malt extract tin in warm water for 10 minutes to make pouring easier",
      "A standard homebrew kit makes ~40 pints — split into quarters for 10-pint Pinter batches",
      "Weigh or measure carefully to keep batches consistent",
    ],
  },
  {
    title: "Add to Pinter",
    description:
      "Pour the measured malt extract into the sanitised Pinter. If the kit includes enhancer, brewing sugar, or hop pellets, add the proportioned amount now.",
    tips: [
      "Pour slowly to avoid splashing and introducing too much air at this stage",
      "Use a small amount of warm water to rinse the last of the extract from the measuring jug",
      "If using dry hops, save them for adding later in fermentation for more aroma",
    ],
  },
  {
    title: "Fill with Water",
    description:
      "Top up the Pinter with cold water to the 10-pint line. Use tap water — most UK tap water works fine. Give it a good stir to dissolve the extract fully.",
    tips: [
      "Cold water is fine — the yeast can handle it and it avoids thermal stress on the Pinter",
      "Stir vigorously for 2 minutes to ensure the extract is fully dissolved",
      "Check the liquid level is at the fill line — too much or too little affects the brew",
    ],
  },
  {
    title: "Pitch Yeast",
    description:
      "Sprinkle the yeast on top of the liquid. Use the proportioned amount from the kit sachet. Don't stir it in — just let it sit on the surface.",
    tips: [
      "Quarter the yeast sachet for a 10-pint batch if the kit is for 40 pints",
      "The ideal temperature for most ale yeasts is 18-22°C",
      "Seal the Pinter lid firmly after pitching",
    ],
  },
  {
    title: "Fermentation",
    description:
      "Leave the Pinter in a warm spot (18-22°C) for 5-7 days. You'll see bubbling in the first 24-48 hours as fermentation gets going. Don't open the lid during this time.",
    tips: [
      "A consistent temperature is more important than hitting an exact number",
      "Keep out of direct sunlight — a cupboard or corner works well",
      "No bubbling after 48 hours? Check the lid is sealed properly",
      "Don't be tempted to open the lid and check — patience!",
    ],
  },
  {
    title: "Conditioning",
    description:
      "After fermentation is complete, the beer needs 2-3 days to condition. This lets the flavour develop and the beer to clear. Keep the Pinter in the same warm spot.",
    tips: [
      "Some kits benefit from longer conditioning — up to 5 days for darker beers",
      "The beer should look clearer than during active fermentation",
      "This is the hardest part — resist the urge to taste!",
    ],
  },
  {
    title: "Ready to Drink",
    description:
      "Your beer is ready! Move the Pinter to the fridge for at least 4 hours to chill, then pour and enjoy. The first pint may be slightly yeasty — that's normal.",
    tips: [
      "Chill for at least 4 hours, overnight is even better",
      "Pour gently to leave the yeast sediment at the bottom",
      "Beer will keep in the Pinter for about 5-7 days once chilled",
      "Take notes on what you'd change for next time",
    ],
  },
];
