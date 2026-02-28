
export const PRESET_PROMPTS = [
    "A cinematic shot of a person walking through a neon-lit city street at night, rain pouring down.",
    "Slow motion shot of a person running on a beach during a golden hour sunset, cinematic style.",
    "A luxurious fashion shoot, high-end clothing, dramatic lighting, in a modern architectural setting.",
    "A person dancing in a field of wildflowers, ethereal and dreamlike atmosphere, soft focus.",
    "Close-up shot of a person's face, looking into the camera with intense emotion, dramatic shadows.",
];

export const FACIAL_CONSISTENCY_INSTRUCTIONS = `
Use the uploaded reference images.
Maintain exact facial structure, eye shape, eyebrow thickness, nose shape, lip shape, jawline, skin tone, and hair style from the reference photos.
Do not modify identity.
No face distortion.
No different person.
Only change pose and camera angle.
Maintain strict facial consistency with the  provided reference images. Preserve exact facial structure, eye shape, eyebrow thickness, nose shape, lip shape, jawline, skin tone, and hair density. Do not alter core facial features. Only adapt pose, lighting, and expression. Ultra-realistic skin texture. No face distortion. No identity drift.
`;

export const LOADING_MESSAGES = [
    "Sending to generation queue...",
    "Warming up AI models...",
    "AI is processing your request...",
    "Generating initial video frames...",
    "Applying character identity lock...",
    "Rendering high-quality frames...",
    "Stitching video and adding effects...",
    "Applying final touches...",
    "Almost there, finalizing your video...",
];
