const User = require('../models/userModel')

async function ensureAuthenticated(req, res, next) {
    console.log('inside enusure authenticated');

    if (req.isAuthenticated()) {
        if (req.user.id) {   /* checking the id of user  */
            const user = await isBlockCheck(req.user.id);
            if (user.isBlock) {    /*** if user status is blocked user will be redirected to
                                              login page after clearing the session ***/
                req.logout(function (err) {
                    if (err) {
                        next(err);
                    }
                })
              
                res.redirect('/login')

            } else {
                next();
            }
        }
    } else {
        // if (req.headers.host != req.headers.referer) {
        //   return  res.status(401).send('Un autherised User');
        // }
        res.redirect('/login')
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