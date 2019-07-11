const request = require('request')

const options = {
  url: `http://challenge01.root-me.org/web-serveur/ch35/admin.html/`,
  headers: {
    'Host': 'challenge01.root-me.org',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0'
  }
};
request.cookie('PHPSESSID=tuf5at0r9jnejqjmbq4b34f1a1')
request.get(options, (err, response, body) => {
    if (err) return console.error(err.message)
    console.log(body)
    console.log(response)
})