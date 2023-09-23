const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userModel'); // Import your User model

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Find the user by their email (username)
      const user = await User.findOne({ email });
       if (!user || !await user.isPasswordMatched(password)) {
        return done(null, false, { message: 'Invalid credentials' });
      }

       if(user.isBlock) {          /* checking the user is blocked or not */
        const messages = `OOPS! your Account ${user.email} is blocked for your suspicious acitivity,Please contact our customer team  for further assistance`
        return done(null,false,{message:messages})
      }else{
        return done(null, user); // If the user is found and the password matches , not blocked, return the user
      }

     
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  // Serialize user to the session, for example:
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Deserialize user from the session, for example:
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
