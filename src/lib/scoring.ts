export function calculateHookScore(hook: string) {
    const words = hook.split(" ").length;

    const emotionalWords = ["power", "unlock", "secret", "ultimate", "superhuman", "reclaim"];
    const curiosityWords = ["what if", "secret", "why", "how", "?"];
    const urgencyWords = ["now", "today", "stop", "don't", "never"];

    let retention = 50;
    let emotion = 50;
    let curiosity = 50;
    let impact = 50;

    // Length scoring
    if (words >= 8 && words <= 18) retention += 20;
    if (hook.includes("?")) curiosity += 15;

    emotionalWords.forEach(word => {
        if (hook.toLowerCase().includes(word)) emotion += 8;
    });

    curiosityWords.forEach(word => {
        if (hook.toLowerCase().includes(word)) curiosity += 8;
    });

    urgencyWords.forEach(word => {
        if (hook.toLowerCase().includes(word)) impact += 8;
    });

    retention = Math.min(retention, 100);
    emotion = Math.min(emotion, 100);
    curiosity = Math.min(curiosity, 100);
    impact = Math.min(impact, 100);

    const overall = Math.round((retention + emotion + curiosity + impact) / 4);

    return {
        retention,
        emotion,
        curiosity,
        impact,
        overall
    };
}
