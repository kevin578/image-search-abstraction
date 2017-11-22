const express = require('express');
const fs = require('fs');
var request = require('request');
var app = express();
var mongoose = require('mongoose');


app.set('port', process.env.PORT || 3000);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/image-abstraction', {
  useMongoClient: true
});

mongoose.Promise = global.Promise;



var savedSearch = new mongoose.Schema({
  searchTerm: String
})

var Search = mongoose.model('searches', savedSearch);


app.get('/', (req,res) => {
  fs.readFile('index.html', (err,html) => {
    if (err) {
      throw err;
    }
    res.write(html);
    res.end();
  });
});


app.get('/imagesearch/:id', (req, res) => {
  var id = req.params.id;


  var options = {
    url: 'https://api.cognitive.microsoft.com/bing/v7.0/images/search?',
    headers: {
      'Ocp-Apim-Subscription-Key': 'e8b26a4141244f65a5cb79fc62729131'
    },
    qs: {
      q: id,
      count: '10',
      offset: req.query.offset
    }
  }

  function callback(error, response, body) {
    if (!error) {
      var info = JSON.parse(body);
      var data = info.value
      mapped = data.map((d) => {
        var filtedObject = {
          name: d.name,
          datePublished: d.datePublished,
          contentUrl: d.contentUrl,
          width: d.width,
          height: d.height
        }
        return filtedObject
      })
      res.send(mapped);

      var mongoData = new Search({
        searchTerm: id
      })
      mongoData.save();
    }
    else {
      console.log('bad')
    }
}

  request(options, callback);

});

app.get('/searches', (req,res) => {
  Search.find().limit(10).then((search) => {
    res.send(search);
  })

})




app.listen(app.get('port'), function() {
  console.log('Server started');
});
