var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/users');
var fb = require('../fb.js');

module.exports = function(passport) {
 passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: fb.clientID,
        clientSecret: fb.clientSecret,
        callbackURL: fb.callbackURL,
        profileFields: ["emails", "displayName", "name", "birthday"]

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();

                    // set all of the facebook information in our user model
                    newUser.facebook.id    = profile.id; // set the users facebook id                   
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                    newUser.facebook.firstName  = profile.name.givenName; 
                    newUser.facebook.lastName = profile.name.familyName;
                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                    newUser.facebook.DOB = profile.birthday;
                    

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

};
                                      
                    