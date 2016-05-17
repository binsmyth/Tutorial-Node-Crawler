var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
var fs = require('fs');

var START_URL = "https://www.reddit.com/r/javascript/?count=25&after=t3_4jl1oe";
var SEARCH_WORD = "stemming";
var MAX_PAGES_TO_VISIT = 100;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseURL = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {
	if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
		console.log("Reached max limit of number of pages to visit.");
		return;
	}
	var nextPage = pagesToVisit.pop();
	if(nextPage in pagesVisited) {
		//We've already visited this page, so repeat the crawl
		crawl();
	}
	else {
		//New page we haven't visited
		visitPage(nextPage,crawl);
	}
}

function visitPage(url, callback) {
	//Add page to our set
	pagesVisited[url] = true;
	numPagesVisited ++;

	//Make the request
	console.log("Visiting page: " + url);
	request(url, function(error, response, body){
		//Check status code(200 is HTTP OK)
		console.log("Status code: " + response.statusCode);
		if(response.statusCode !== 200) {
			callback();
			return;
		}
		//Parse the document body
		var $ = cheerio.load(body);
		var datetime = new Date();
		fs.appendFileSync('reddit.txt',"***" + datetime + "***\n");
		$('div#siteTable > div.link').each(function(index) {
			var title = $(this).find('p.title > a.title').text().trim();
			var score = $(this).find('div.score.unvoted').text().trim();
			var user = $(this).find('a.author').text().trim();

			console.log("Title: " + title);
			console.log("Score: " + score);
			console.log("User: " + user);
			fs.appendFileSync('reddit.txt', "title: " + title + '\n' +"scorea: "+ score + '\n' +"user: "+ user + '\n');
		});
	});
}

function searchForWord($, word) {
	var bodyText = $('html > body').text();
	return(bodyText.toLowerCase().indexOf(word.toLowerCase()) !== -1)
}

function collectInternalLinks($) {
	var relativeLinks = $("a[href^='/']");
	console.log("Found " + relativeLinks.length + " relative links on page");
	relativeLinks.each(function() {
		pagesToVisit.push(baseURL + $(this).attr('href'));
	});
}