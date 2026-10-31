export default {
    cookieName: "ninho_session",
    durationInDays: 365,
    secureCookie: process.env.SECURE_COOKIE === "true"
};
