var inquirer = require('inquirer');
var mysql = require('mysql');
var customerDBKeys = require('./keys/customerKey.js');

var bamazonDB = mysql.createConnection(customerDBKeys);

bamazonDB.connect(function(err) {
	if (err) {
		throw err;
	}

	// console.log("connected as id " + bamazonDB.threadId);

  // Start Manager Dashboard
  var person = new Manager();
});

function Manager() {

  this.header();
  this.promptMenu();

}

Manager.prototype.header = function(msg) {
  console.log('\033c'); // Clears the terminal
  console.log('============ Manager Dashboard ============');
  if(msg) {
    console.log(msg);
  }
  console.log(' ');
};

Manager.prototype.promptMenu = function() {

  var self = this;


  console.log(' ');
  console.log('------------ MENU -----------');

  inquirer.prompt([
    {
      name: 'option',
      type: 'list',
      message: 'Please choose a menu option: ',
      choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit']
    }
  ]).then(function(menu) {

    switch(menu.option) {
      case 'View Products for Sale':
        self.viewAll();
        break;

      case 'View Low Inventory':
        self.viewLow();
        break;

      case 'Add to Inventory':
        self.addInventory();
        break;

      case 'Add New Product':
        break;

      case 'Exit':
        break;

    }

  });
};


Manager.prototype.addInventory = function() {

  var self = this;

  this.selectAll(function(rows) {

    self.header();

    var arr = [];
    for(var i in rows) {
      arr.push('ID: ' + rows[i].ItemID + ' - ' + rows[i].ProductName + ' / Department: ' + rows[i].DepartmentName + ' / Price: ' + rows[i].Price + '  Qty: ' + rows[i].StockQuantity);
    }

    inquirer.prompt([
      {
        name: 'item',
        type: 'list',
        message: 'Choose an item to add stock to: ',
        choices: arr
      },
      {
        name: 'addStock',
        type: 'input',
        message: 'Now input the amount of stock to add: ',
        validate: function(input) {
          return isNaN(input) ? false : true;
        }
      },
    ]).then(function(products) {

      console.log(products);
      var pid = parseInt(products.item.match(/\d+/));

      var selectedRow = rows.filter(function(obj) {
        // console.log(pid, obj.ItemID, pid === obj.ItemID);
        return pid === obj.ItemID;
      });

      console.log(selectedRow, selectedRow[0].StockQuantity, products.addStock);

      var qty = selectedRow[0].StockQuantity + (parsetInt(products.addStock));

      console.log('before sql');

      var sql = 'UPDATE products SET StockQuantity='+bamazonDB.escape(qty)+' WHERE ItemID='+bamazonDB.escape(pid);
      var insert = [qty, id];
      bamazonDB.query(sql, function(err, response) {
        if(err) throw err;

        if(response.affectedRows === 1) {

          console.log(selectedRow);
          // self.header('Stock Quantity for has been updated!');
          // self.promptMenu();
        }
      });

    });
  });
};

Manager.prototype.viewLow = function() {

  var self = this;

  this.selectAll(function(rows) {

    self.header();

    for(var i in rows) {
      if(rows[i].StockQuantity < 5) {
        console.log('ID: ' + rows[i].ItemID + ' - ' + rows[i].ProductName + ' / Department: ' + rows[i].DepartmentName + ' / Price: ' + rows[i].Price + '  Qty: ' + rows[i].StockQuantity);
      }
    }

    self.promptMenu();
  });
};

Manager.prototype.viewAll = function() {

  var self = this;

  this.selectAll(function(rows) {

    self.header();

    for(var i in rows) {
      console.log('ID: ' + rows[i].ItemID + ' - ' + rows[i].ProductName + ' / Department: ' + rows[i].DepartmentName + ' / Price: ' + rows[i].Price + '  Qty: ' + rows[i].StockQuantity);
    }

    self.promptMenu();

  });
};

Manager.prototype.selectAll = function(callback) {
  bamazonDB.query('SELECT * FROM products', function(err, rows) {
    if(err) throw err;

    if(typeof callback === 'function') {
      callback(rows);
    }
  });
};
