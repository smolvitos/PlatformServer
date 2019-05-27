const passport = require('passport')
const passportJwt = require('passport-jwt')
const UserModel = require('../models/user')

const JwtStrategy = passportJwt.Strategy //Стратегия аутентификации
const ExtractJwt = passportJwt.ExtractJwt //Функция выделение токена из заголовков

const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: 'dockerappnodejs'
}

const Strategy = new JwtStrategy(jwtOptions, (jwt_payload, done) => {
	console.log(`JWTPaiload ${jwt_payload.username}`)
	UserModel.findOne({ username: jwt_payload.username })
		.then((user) => {
			//console.log(user)
			if (!user) {
				done(null, false)
			}
			done(null, user)
		})
		.catch((error) => {
			done(error)
		})
})

module.exports.init = (passport) => {
	passport.use(Strategy)
	return passport
}

module.exports.jwtOptions = jwtOptions
