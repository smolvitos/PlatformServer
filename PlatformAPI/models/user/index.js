const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = mongoose.Schema({
	username: {
    	type: String,
    	unique: true,
    	required: true
  	},
  	password: {
    	type: String,
    	required: true
  	},
  	firstName: String,
	lastName: String,
	age:  {
		type: Number,
		min: 1,
		max: 100
	},
	gender: String,
    isAdmin: Boolean,
    passedFlags: Array
})

UserSchema.methods.comparePassword = function(password, callback) {
	//console.log(this.model('User').password)
	bcrypt.compare(password, this.password, (error, matches) => {
		//console.log(this.model('User').password)
		//console.log(password)
		if (error) return callback(error)
		callback(null, matches)
	})
}

UserSchema.pre('save', function(next) {
	const user = this
	if (this.isModified('password') || this.isNew) {
		bcrypt.genSalt(10, (error, salt) => {
			if (error) return next(error)
			bcrypt.hash(user.password, salt, (error, hash) => {
				if (error) return next(error)
				user.password = hash
				next()
			})
		})
	} else {
		next()
	}
})

UserSchema.pre('updateOne', function(next) {
	const user = this
	if (this.password) {
		bcrypt.genSalt(10, (error, salt) => {
			if (error) return next(error)
			bcrypt.hash(user.password, salt, (error, hash) => {
				if (error) return next(error)
				user.password = hash
				next()
			})
		})
	} else {
		next()
	}
})


const UserModel = mongoose.model('platformusers', UserSchema)

module.exports = UserModel