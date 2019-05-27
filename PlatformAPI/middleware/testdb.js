const mongoose = require('mongoose')

const TestSchema = mongoose.Schema({
	name: {
		type: String,
    	unique: true,
    	required: true
	},
	surname: {
    	type: String,
    	required: true
  }
})


const TestModel = mongoose.model('testdoc', TestSchema)

const names = ['Vanya','Petya','Dima']
const surnames = ['Petrov','Demyanoiv','Vasilev']

module.exports = (req, res) => {
  /*for (let i = 0; i < 2; i++) {
    const testEntity = new TestModel({
      name: names[i],
      surname: surnames[i]
    })

    testEntity.save((err, data) => {
      if (err) console.error(err)
      else console.log(data)
    })
  }*/
  let str = 'any'
  TestModel.find({ name: new RegExp(str, 'i')}).exec()
  .then((docs) => {
    res.json(docs)
  })
  .catch((err) => {
    console.error(err)
  })
}
