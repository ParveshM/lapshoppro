// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const User = require('../models/userModel');

// passport.use(new LocalStrategy(
//   {
//     usernameField: 'email', 
//     passwordField: 'password'
//   },
//   async (email, password, done) => {
//     try {
//         console.log('Email' ,email);
//       // Find the user by their email (username)
//       const user = await User.findOne({ email });
//       console.log('User:', user);

//       // If the user is not found or the password doesn't match, return false
//       if (!user || !await user.isPasswordMatched(password)) {
//         console.log(user.role);
//         return done(null, false, {message: 'Invalid credentials' });
//       }
//       else if(user.role === 'use'){
//         return done(null, false, {message: 'You are not an Admin' });
//       }

//       // If the user is found and the password matches, return the user
//       return done(null, user);
//     } catch (error) {
//       return done(error);
//     }
//   }
// ));

// passport.serializeUser((user, done) => {
//   // Serialize user to the session, for example:
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     // Deserialize user from the session, for example:
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error);
//   }
// });
