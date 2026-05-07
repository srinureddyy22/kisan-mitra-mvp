window.kisanMitraSeed = {
  languages: ["English", "Hindi", "Telugu"],
  crops: {
    paddy: {
      name: "Paddy (Rice)",
      waterNeedMm: 8.2,
      droughtThreshold: 48,
      focus: "Protect tillers, keep water steady, and watch for disease after leaf wetness.",
      valueGoal: "Yield improves when tillers stay even and stress is reduced before panicle formation.",
      stages: {
        establishment: "Keep plant stand even and avoid sudden drying after sowing or transplanting.",
        vegetative: "This is the main tiller-building stage, so uneven patches should be checked early.",
        flowering: "Flowering paddy loses yield quickly if heat or moisture stress is ignored.",
        harvest: "Avoid late stress that can reduce grain fill and harvest quality."
      }
    },
    maize: {
      name: "Maize",
      waterNeedMm: 6.8,
      droughtThreshold: 42,
      focus: "Support root uptake, protect leaf area, and avoid silking stress.",
      valueGoal: "Strong cob set depends on stable moisture and quick action when leaves show stress.",
      stages: {
        establishment: "Secure plant stand and check for gaps, weak roots, or early pest feeding.",
        vegetative: "Rapid canopy growth means yellowing or wilting should be checked before it spreads.",
        flowering: "Silking stress can sharply reduce cob formation and grain set.",
        harvest: "Protect stalk strength and line up a clean harvest window."
      }
    },
    cotton: {
      name: "Cotton",
      waterNeedMm: 6.1,
      droughtThreshold: 38,
      focus: "Balance vegetative growth with boll retention and close pest scouting.",
      valueGoal: "Cotton benefits from disciplined scouting because hidden pest pressure can reduce picking value.",
      stages: {
        establishment: "Protect early stand and watch for sucking pests on young growth.",
        vegetative: "Keep the crop balanced so it does not become too lush or too stressed.",
        flowering: "Flowering cotton needs stable conditions and a close eye on new growth.",
        harvest: "Protect open bolls and avoid regrowth before picking."
      }
    },
    tomato: {
      name: "Tomato",
      waterNeedMm: 5.9,
      droughtThreshold: 36,
      focus: "Protect fruit quality and stay ahead of pest and fungal pressure.",
      valueGoal: "Tomato returns improve when cracking, rot, and uneven harvests are prevented early.",
      stages: {
        establishment: "Help transplants recover quickly and avoid root-zone stress.",
        vegetative: "Build canopy health without trapping too much humidity inside the crop.",
        flowering: "Flowering tomatoes need even moisture and careful pest checking.",
        harvest: "Harvest rhythm and fruit quality matter as much as plant health now."
      }
    },
    chilli: {
      name: "Chilli",
      waterNeedMm: 5.1,
      droughtThreshold: 34,
      focus: "Protect flower retention and keep new growth free from sucking pests.",
      valueGoal: "Chilli plants hold yield better when stress is managed before flowers and young fruits drop.",
      stages: {
        establishment: "Protect seedlings and stop early stress before roots settle in.",
        vegetative: "Check new leaves often because pest pressure can build quietly.",
        flowering: "Flowering chilli needs steady moisture and quick attention to curling or drop.",
        harvest: "Protect pod quality and avoid last-minute stress close to picking."
      }
    },
    sugarcane: {
      name: "Sugarcane",
      waterNeedMm: 9.1,
      droughtThreshold: 52,
      focus: "Drive cane girth while preventing dry patches across long rows.",
      valueGoal: "Timely water and patch-based correction protect cane weight and factory readiness.",
      stages: {
        establishment: "Encourage strong sett or ratoon establishment with even moisture.",
        vegetative: "This is the core biomass-building stage, so weak rows should be checked early.",
        flowering: "Protect sugar accumulation and avoid sharp stress swings.",
        harvest: "Align water and cutting plans with likely transport or factory movement."
      }
    },
    wheat: {
      name: "Wheat",
      waterNeedMm: 5.2,
      droughtThreshold: 40,
      focus: "Protect leaf health and keep the canopy even through grain fill.",
      valueGoal: "Wheat yield and grain quality improve when rust and moisture stress are caught early.",
      stages: {
        establishment: "Support even emergence and correct drainage issues before they spread.",
        vegetative: "Maintain moderate moisture and check for striping or patchy yellowing.",
        flowering: "Flowering wheat is sensitive to heat and sudden moisture stress.",
        harvest: "Keep grain fill stable and avoid late lodging or quality loss."
      }
    }
  },
  problems: {
    none: {
      label: "No clear symptom yet",
      cause: "No major visible issue has been reported yet, so the first goal is to compare weak and healthy patches.",
      urgency: "Routine",
      action: "Walk the field in a zig-zag path and compare one weak patch with one healthy patch before spending money.",
      lowCost: "Mark a weak patch with sticks or ribbon and re-check it tomorrow morning."
    },
    yellowing: {
      label: "Yellowing leaves",
      cause: "Yellowing often comes from nutrient stress, water imbalance, root issues, or early disease pressure.",
      urgency: "Medium",
      action: "Check whether the yellowing is uniform, patchy, or moving to new leaves before taking any blanket action.",
      lowCost: "Start with a root-zone moisture check and compare leaf color in healthy and weak rows."
    },
    wilting: {
      label: "Wilting",
      cause: "Wilting is usually linked to low root-zone moisture, root damage, or strong midday heat.",
      urgency: "High",
      action: "Check the root zone first and see whether leaves recover by evening before treating the whole field.",
      lowCost: "Press soil by hand near the root zone in weak and healthy patches to compare moisture."
    },
    spots: {
      label: "Leaf spots",
      cause: "Leaf spots can point to fungal or bacterial pressure, especially after humidity or repeated splash on leaves.",
      urgency: "High",
      action: "Inspect affected leaves on both sides, separate the worst patch, and check whether the problem is moving quickly.",
      lowCost: "Remove a few badly affected leaves from one small patch and watch whether fresh spots still appear."
    },
    holes: {
      label: "Chewing damage",
      cause: "Holes on leaves or fruit often come from caterpillars, beetles, or other chewing insects.",
      urgency: "Medium",
      action: "Scout at dawn or dusk when feeding is easier to spot and check whether damage is fresh or old.",
      lowCost: "Hand-pick visible larvae in a small patch and monitor whether new damage continues overnight."
    },
    curling: {
      label: "Leaf curling",
      cause: "Leaf curling may come from sucking pests, viral pressure, spray injury, or heat stress on new growth.",
      urgency: "Medium",
      action: "Inspect new growth closely and look under leaves before deciding whether it is a nutrition, pest, or weather issue.",
      lowCost: "Shake a few plants over white paper to check for tiny insects before spending on wider action."
    },
    slowGrowth: {
      label: "Slow growth",
      cause: "Slow growth usually points to root stress, weak nutrition, compaction, or repeated moisture swings.",
      urgency: "Medium",
      action: "Compare plant height, root health, and moisture across good and weak rows before making corrections.",
      lowCost: "Dig a few shallow root checks in weak and healthy patches to compare moisture and root spread."
    }
  },
  scenarios: [
    {
      id: "paddy-yellowing",
      label: "Paddy Yellowing",
      note: "Uneven color after showers",
      values: {
        farmerName: "Ramu",
        location: "Warangal",
        language: "English",
        crop: "paddy",
        stage: "vegetative",
        acres: 5,
        irrigationSource: "canal",
        symptom: "yellowing",
        affectedArea: 28,
        soilMoisture: 39,
        canopyTemp: 31,
        rainForecast: 12,
        goal: "save-crop",
        budget: "balanced",
        urgency: "today"
      }
    },
    {
      id: "maize-wilting",
      label: "Dry Maize",
      note: "Flowering heat stress",
      values: {
        farmerName: "Suresh",
        location: "Nizamabad",
        language: "English",
        crop: "maize",
        stage: "flowering",
        acres: 8,
        irrigationSource: "borewell",
        symptom: "wilting",
        affectedArea: 34,
        soilMoisture: 27,
        canopyTemp: 35,
        rainForecast: 2,
        goal: "increase-yield",
        budget: "protect-yield",
        urgency: "today"
      }
    },
    {
      id: "cotton-curling",
      label: "Cotton Curling",
      note: "New growth under pressure",
      values: {
        farmerName: "Lakshmi",
        location: "Adilabad",
        language: "English",
        crop: "cotton",
        stage: "flowering",
        acres: 6,
        irrigationSource: "rainfed",
        symptom: "curling",
        affectedArea: 18,
        soilMoisture: 34,
        canopyTemp: 33,
        rainForecast: 5,
        goal: "save-crop",
        budget: "low",
        urgency: "this-week"
      }
    },
    {
      id: "tomato-spots",
      label: "Tomato Spots",
      note: "Fruit stage disease watch",
      values: {
        farmerName: "Anita",
        location: "Kurnool",
        language: "English",
        crop: "tomato",
        stage: "harvest",
        acres: 2,
        irrigationSource: "drip",
        symptom: "spots",
        affectedArea: 22,
        soilMoisture: 44,
        canopyTemp: 29,
        rainForecast: 8,
        goal: "harvest-quality",
        budget: "balanced",
        urgency: "today"
      }
    }
  ],
  prompts: [
    "My crop is wilting by afternoon. What should I check first?",
    "Give me a simple solution for leaf spots in the next 24 hours.",
    "What low-cost steps can I take before calling an expert?",
    "How should I adjust watering if rain may come tomorrow?"
  ]
};
