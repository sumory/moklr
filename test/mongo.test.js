var mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.100.186/moklr');

var User = mongoose.model('user', { username: String, pwd:String });

var u = new User({ username: 'test', pwd: 'pwd' });
u.save(function (err) {
    if (err) // ...
        console.log('meow');
});
