/**
 * Stable photos from Unsplash (free license), picked by topic. Served from the
 * images.unsplash.com CDN at a fixed size so nothing depends on a random image service.
 */
const ID = {
    tomatoes: "1567375698463-b8dabb1319cf",
    tomatoCrate: "1758972574908-bc43ad077156",
    greens: "1617884638394-d9eef1b0f40e",
    mushrooms: "1542913235-1f46ce06443d",
    herbs: "1758082265634-c360a7504f3b",
    squash: "1506785212-4b1c7d23a1cc",
    produce: "1464226184884-fa280b87c399",
    harvestBasket: "1624668430039-0175a0fbf006",
    farmer: "1605000797499-95a51c5269ae",
    watering: "1515150144380-bca9f1650ed9",
    delivery: "1593113630400-ea4288922497",
    truck: "1618582948377-cd7eb0e8cb14",
    plating: "1775513153018-0c7ac7899751",
    chef: "1572715376701-98568319fd0b",
    crate: "1635341083388-84ca0a1733ca",
    crateMixed: "1635341083777-5f93a755e916",
    paperwork: "1554224155-1696413565d3",
    phone: "1780359399081-51bd2b788b02",
    barn: "1588395532936-179b5891b4c8",
    sunset: "1560493676-04071c5f467b",
    rows: "1529313780224-1a12b68bed16",
    washing: "1578338244251-6258f907691b",
    basket: "1609842947419-ba4f04d5d60f",
    kitchen: "1622021142947-da7dedc7c39a",
    vegDish: "1514537099923-4c0fc7c73161",
    salad: "1569760142069-bc6838de16c1",
} as const;

export type PhotoKey = keyof typeof ID;

export function photoUrl(key: PhotoKey, width = 900): string {
    return `https://images.unsplash.com/photo-${ID[key]}?auto=format&fit=crop&w=${width}&q=75`;
}

/** Scene words first, so "tomato dish plated" is a dish, not raw tomatoes. */
const RULES: [RegExp, PhotoKey[]][] = [
    [/invoice|paperwork|desk|bill/, ["paperwork"]],
    [/phone|call/, ["phone"]],
    [/barn/, ["barn"]],
    [/sunset|golden/, ["sunset"]],
    [/wash/, ["washing"]],
    [/packing|boxes/, ["crateMixed"]],
    [/truck|road|route/, ["truck"]],
    [/van|deliver/, ["delivery"]],
    [/plating/, ["plating"]],
    [/dish|plated|special/, ["vegDish", "salad"]],
    [/kitchen/, ["kitchen"]],
    [/chef/, ["chef"]],
    [/basket/, ["basket", "harvestBasket"]],
    [/crate/, ["crate", "crateMixed"]],
    [/tomato/, ["tomatoes", "tomatoCrate"]],
    [/green|salad|lettuce|kale|spinach|arugula|chard/, ["greens"]],
    [/mushroom/, ["mushrooms"]],
    [/herb|basil|mint|cilantro|parsley/, ["herbs"]],
    [/squash|zucchini|pumpkin|gourd/, ["squash"]],
    [/harvest|farmer|grower/, ["farmer", "harvestBasket"]],
    [/row|field|farm|crop|land/, ["rows", "sunset", "watering"]],
];

/** Pick a photo for a free-text topic. `seed` chooses among close alternatives. */
export function photoFor(topic: string, seed = 0, width = 900): string {
    const t = topic.toLowerCase();
    for (const [re, keys] of RULES) {
        if (re.test(t)) return photoUrl(keys[Math.abs(seed) % keys.length], width);
    }
    return photoUrl("produce", width);
}
