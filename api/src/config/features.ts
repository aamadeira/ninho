const allFeatures = ["todos", "shopping", "recipes", "calendar"];

const disabledFeatures = (process.env.DISABLED_FEATURES || "").split(",").map((feature) => feature.trim().toLowerCase());

export default {
    enabled: allFeatures.filter((feature) => !disabledFeatures.includes(feature))
};
