var inquirer = require('inquirer');
var mysql = require('mysql');
var customerDBKeys = require('./keys/customerKey.js');

var connection = mysql.createConnection(customerDBKeys);


connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});
