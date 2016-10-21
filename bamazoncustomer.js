var inquirer = require('inquirer');
var mysql = require('mysql');
var customerDBKeys = require('./keys/customerKey.js');

var bamazonDB = mysql.createConnection(customerDBKeys);

bamazonDB.connect(function(err) {
	if (err) {
		throw err;
	}

	console.log("connected as id " + bamazonDB.threadId);
});


function listProducts(callback) {

  var sql = 'SELECT ??,??,?? FROM ??';
  var inserts = ['itemID','ProductName','Price', 'products'];
  sql = mysql.format(sql,inserts);

	bamazonDB.query(sql, function(err, rows) {
		if (err) {
			throw err;
		}

		for (var i = 0; i < rows.length; i++) {
			console.log(rows[i].itemID + ' | ' + rows[i].ProductName + ' | ' + rows[i].Price);
		}

    if(typeof callback === 'function') {
      callback();
    }

	});
}

function selectProducts(id, qty) {
  var sql = 'SELECT * FROM ?? WHERE itemID="??"';
  var inserts = ['bamazon.products', id];
  sql = mysql.format(sql,inserts);

  bamazonDB.query(sql, function(err, rows) {
		if (err) {
			throw err;
		}

    callback(rows);

  });
}

function promptCatalog() {

	listProducts(function() {
    inquirer.prompt([{
  		type: 'input',
  		name: 'id',
  		message: 'Please enter the ID of the item you wish to purchase: '
  	}, {
  		type: 'input',
  		name: 'qty',
  		message: 'How many would you like to purchase? '
  	}]).then(function(selection) {

      selectProducts(selection.id, selection.qty, function(rows) {
        console.log(rows);
      });

  	});
  });

}

promptCatalog();
