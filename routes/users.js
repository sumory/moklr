var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/save', function(req, res, next){
    var name = req.body.name;
    var age = req.body.age;
    var sex = req.body.sex;

    console.log(name, age, sex)

    return res.json({
        name: name,
        age: age,
        sex: sex
    });
});

module.exports = router;
