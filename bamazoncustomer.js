var inquirer = require('inquirer');
var mysql = require('mysql');
var customerDBKeys = require('./keys/customerKey.js');

var bamazonDB = mysql.createConnection(customerDBKeys);

bamazonDB.connect(function(err) {
	if (err) {
		throw err;
	}

	// console.log("connected as id " + bamazonDB.threadId);

  // Start Bamazoning!!
  var person = new Customer();
});

function Customer() {

  this.pid = 0; // item id
  this.productName = ''; // item name
  this.price = 0; // item price
  this.qty = 0; // qty requested
  this.newQty = 0; // diff in qty & stock qty

  var self = this;

  this.getProducts = function(callback) {

    var sql = 'SELECT ??,??,?? FROM ??';
    var inserts = ['itemID','ProductName','Price', 'products'];
    sql = mysql.format(sql,inserts);

  	bamazonDB.query(sql, function(err, rows) {

  		if (err) throw err;

      var arr = [];

  		for (var i = 0; i < rows.length; i++) {
  			arr.push(rows[i].itemID + ' | ' + rows[i].ProductName + ' | ' + rows[i].Price);
  		}

      if(typeof callback === 'function') {
        callback(arr);
      }

  	});
  };

  this.promptCatalog = function(msg) {

    console.log('\033c'); // Clears the terminal
    console.log('======================================');
    console.log('                                      ');
    console.log('           Welcome to Bamazon         ');
    console.log('                                      ');
    console.log('======================================');
    if(msg) {
      console.log(msg);
    }
    console.log(' ');

  	self.getProducts(function(itemList) {
      inquirer.prompt([{
    		type: 'list',
    		name: 'item',
    		message: 'Please choose/enter an item from our catalog: ',
        choices: itemList
    	}, {
    		type: 'input',
    		name: 'qty',
    		message: 'How many would you like to purchase? ',
        validate: validateNaN
    	}]).then(function(selection) {

        var itemArr = selection.item.split(' | ');

        // Setting class scope values
        self.pid = parseInt(itemArr[0]); // Split and return the Product ID, then parse int
        self.productName = itemArr[1];
        self.price = parseFloat(itemArr[2]);
        self.qty = parseInt(selection.qty); // Parse int the quantity entered

        self.selectProducts(function(itemSelected) {

          // console.log(itemSelected.StockQuantity, qty);
          if(itemSelected[0].StockQuantity >= self.qty) {
            self.newQty = itemSelected[0].StockQuantity - self.qty;

            // Update quantity
            self.updateProducts(function(response) {
              if(response.affectedRows === 1) {
                console.log(' ');
                console.log(self.qty + 'x ' + self.productName + ' has been purchased for a grand total cost of $'+ (self.price*self.qty).toFixed(2));
                self.purchaseMore();
              }
            });

          } else {
            self.promptCatalog('Error: Stock available insufficient, please order again');
          }

        });

    	});
    });

    function validateNaN(input) {
      return isNaN(input) ? false : true;
    }

  };

  this.promptCatalog();

}


Customer.prototype.updateProducts = function(callback) {

  bamazonDB.query('UPDATE products SET StockQuantity='+bamazonDB.escape(this.newQty)+' WHERE ItemID='+bamazonDB.escape(this.pid), function(err, rows) {
    if(typeof callback === 'function') {
      callback(rows);
    }
  });

};

Customer.prototype.selectProducts = function(callback) {

  var sql = 'SELECT * FROM products WHERE ItemID=' + bamazonDB.escape(this.pid);

  bamazonDB.query(sql, function(e,rows) {
    if(e) throw e;

    if(typeof callback === 'function')
      callback(rows);

  });

};

Customer.prototype.purchaseMore = function() {

  var self = this;

  console.log(' ');

  inquirer.prompt([{
    type: 'confirm',
    message: 'Would you like to continue shopping?',
    name: 'shopAgain'
  }]).then(function(answer) {

    if(answer.shopAgain) {
      self.promptCatalog();
    } else {
      // End DB connection
      bamazonDB.end(function(err) {
        console.log(' ');
        console.log('Thank you for shopping at Bamazon!');
      });
    }

  });
};
