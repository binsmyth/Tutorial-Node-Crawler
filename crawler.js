var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var exphbs = require('express-handlebars');
var app     = express();

var hbs = exphbs.create({});

app.engine('handlebars', hbs.engine);

app.set('view engine','handlebars');

var products = [];


request('http://www.gadgetsinnepal.com.np/',function(err,res,body){
	var $ = cheerio.load(body);
	var productcolxn = {
		source: "Gadgets in Nepal",
		link: 'http://www.gadgetsinnepal.com.np/',
		items:[]
	};

	$('.recent-module .recent-module .recent-post').each(function(i,obj){
		var title = $(obj).find('h2 a').text();
		var link = $(obj).find('h2 a').attr('href');
		var date = $(obj).find('.post-meta span').text();

		var item = {
			title: title,
			link: link,
			date: date
		};
		productcolxn.items.push(item);
	});
	products.push(productcolxn);
});


app.get('/', function(req,res){
	res.render('index',{products: products});
});

var server = app.listen(3000);