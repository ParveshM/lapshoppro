const User = require('../models/userModel')

async function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.id) {   /* checking the id of user  */

            const user = await isBlockCheck(req.user.id);
            console.log('user stats', user.isBlock);

            if (user.isBlock) {    /* if user status is blocked user will be redirected to
                                              login page after clearing the session */
                req.logout(function (err) {
                    if (err) {
                        next(err);
                    }
                })
                res.redirect('/login')

            }    else {
                next();
            }
        }
    }
}


function ensureNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('back')

    } else {
        next()
    }
}

const isBlockCheck = async (id) => {
    const isBlockChecking = await User.findOne({ _id: id });
    return isBlockChecking;
}

module.exports = { ensureAuthenticated, ensureNotAuthenticated }