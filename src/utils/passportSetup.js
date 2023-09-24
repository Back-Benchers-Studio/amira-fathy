import passport from "passport"
import googleOauth from 'passport-google-oauth2' 
import dotenv from 'dotenv'
dotenv.config()
const GoogleStrategy = googleOauth.Strategy;

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})


passport.use(new GoogleStrategy({
    clientID: process.env.googleClientID,
    clientSecret: process.env.googleClientSecret,
    callbackURL: process.env.googleCallbackURL,
    passReqToCallback: true
}, (request, accessToken, refreshToken, profile, done) => {
    done(null, profile)
}))