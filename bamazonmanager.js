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
    console.log(' ');
    console.log('> ' + msg);
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
        self.addProduct();
        break;

      case 'Exit':
        self.exit();
        break;

      default:
        self.promptMenu();
        break;
    }

  });
};

Manager.prototype.exit = function() {
  bamazonDB.end(function() {
    console.log(' ');
    console.log('Signed off.');
  });
};

Manager.prototype.addProduct = function() {

  var self = this;

  this.header();

  inquirer.prompt([
    {
      name: 'ProductName',
      type: 'input',
      message: 'Enter the product name: ',
    },
    {
      name: 'DepartmentName',
      type: 'input',
      message: 'Enter the department it\'s under: ',
    },
    {
      name: 'Price',
      type: 'input',
      message: 'Enter the price: ',
      validate: function(input) {
        return isNaN(input) ? false : true;
      }
    },
    {
      name: 'StockQuantity',
      type: 'input',
      message: 'Enter the stock inventory: ',
      validate: function(input) {
        return isNaN(input) ? false : true;
      }
    },
  ]).then(function(products) {

    products.Price = parseFloat(products.Price).toFixed(2);
    products.StockQuantity = parseInt(products.StockQuantity);

    bamazonDB.query('INSERT INTO products SET ?', products, function(err, results) {
      if(err) throw err;

      if(results.affectedRows > 0) {
        self.header('Product '+products.ProductName+' has been added to the database!');
        self.promptMenu();
      }
    });

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

      // Pull first number
      var pid = parseInt(products.item.match(/\d+/));

      // Find matching row
      var selectedRow = rows.filter(function(obj) {
        return pid === obj.ItemID;
      });

      var qty = selectedRow[0].StockQuantity + parseInt(products.addStock);

      var sql = 'UPDATE products SET StockQuantity='+bamazonDB.escape(qty)+' WHERE ItemID='+bamazonDB.escape(pid);

      bamazonDB.query(sql, function(err, response) {
        if(err) throw err;

        if(response.affectedRows === 1) {
          self.header('Stock Quantity for "'+ selectedRow[0].ProductName +'" has been updated from ' + selectedRow[0].StockQuantity + ' to '+ qty +'!');
          self.promptMenu();
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
