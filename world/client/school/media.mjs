// Completed OpenArt clips, optimized for same-site playback. Local parent clips take priority.
const clip=(id,duration)=>({src:new URL(`../../assets/school/videos/${id}-v1.mp4`,import.meta.url).href,duration});
export const SCHOOL_MEDIA={bus:clip('bus',30),breakfast:clip('breakfast',12),bathroom:clip('bathroom',30),lunch:clip('lunch',20),dismissal:clip('dismissal',15)};
