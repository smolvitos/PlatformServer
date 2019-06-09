module.exports = (req, res) => {
    if (req.user.isAdmin) next()
    else {
        res.status(401).json({
		status: 'failed',
	    message: "You have not admin's privilege"
	    })
    }
}