var rp = require("request-promise");
var request = require("request");
var fs = require("fs");
var cheerio = require("cheerio");
var q = require("q");
var pdf = require("html-pdf");

try {
	fs.accessSync(__dirname + "/htmls", fs.F_OK);
} catch (e) {
	fs.mkdirSync("htmls");
}


function getCounter(i) {
	if ((1 <= i) && (i <= 9)) {
		return "00" + i;
	} else if ((10 <= i) && (i <= 99)) {
		return "0" + i;
	} else {
		return i;
	}
}

function Article(title, content) {
	this.title = title;
	this.content = content;
}

Article.prototype.getNumber = function() {
	return this.title.substring(0, this.title.indexOf("."));
};

function getResult () {
	var def = q.defer();
	var i = 0;
	while (i < 100) {
		i++;
		var results = [];
		request("http://www.informatik.uni-leipzig.de/~duc/sach/phongtuc/cau_" + getCounter(i) + ".html", function(err, res, body) {
			var $ = cheerio.load(body);
			var title = $('table td:last-child h3 font').text();
			var content = $('table td:last-child').html();
			var article = new Article(title, content);
			
			results.push(article);
			if (results.length == 100) {
				def.resolve(results);
			}
		});

	}

	return def.promise;
}

function getFullContents() {
	var def = q.defer();
	getResult().then(function(results) {
		results.sort(function(a, b) {
			return a.getNumber() - b.getNumber();
		});
		
		var contents = results.map(function(item) {
			return item.content;
		});
		
		def.resolve(contents.join(""));
	});

	return def.promise;
}

//write to html
getFullContents().then(function(contents) {
	fs.writeFileSync("100dieu.html", contents, "utf8");
	var html = fs.readFileSync('./100dieu.html', 'utf8');
	var options = { 
		format: 'A4',
		border: {
		    "top": "0.5in",           
		    "right": "0.5in",
		    "bottom": "0.5in",
		    "left": "0.5in"
	    }, 
	};
	
	//convert to pdf
	pdf.create(html, options).toFile('./100-dieu-can-biet-phong-tuc-viet-nam.pdf', function(err, res) {
		if (err) return console.log(err);
		console.log(res);
	});
});







			




