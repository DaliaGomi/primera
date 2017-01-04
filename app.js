var express = require('express'); //Funcionlidad de framework express
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Schema = mongoose.Schema;
var multer = require('multer');
var cloudinary = require('cloudinary');
var app_password = '12345';
var method_override = require("method-override");



cloudinary.config({
	cloud_name: "djoyxmcdnh",
	api_key: "525642349438944",
	api_secret: "pWzTgZ3xmFO-he-HH63fNysAt98"

});


var app = express();

mongoose.connect("mongodb://localhost/primera_pagina");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var uploader = multer({dest: "./uploads"});
var middleware_upload = uploader.single('image_avatar');
app.use(method_override("_method"));
//Definir el schema de nuestros productos

var productSchema = {
	title:String,
	description:String,
	imageUrl:String,
	pricing: Number
};

//Modelo encargado de los datos "Consulta a la base de datos"


var Product = mongoose.model("Product", productSchema);

app.set("view engine", "jade");
app.use(express.static("public"));

app.get("/",function(req,res){

	res.render("index");
});

app.get('/menu',function(req,res){
	Product.find(function(error,documento){
		if(error){console.log(error);}
			res.render("menu/index", {products: documento})
	});
});


//EDITAR
app.get("/menu/edit/:id", function(req,res){
	var id_producto = req.params.id;
	console.log(id_producto);
	//query a la base de datos para solicitar el producto que queremos modificar

	Product.findOne({"_id": id_producto}, function(error,producto){
		console.log(producto);
		console.log(error);
		res.render("menu/edit",{ product: producto});
	});
});

//MODIFICAR Un PRODUCTO "EDITAR"

app.put("/menu/:id",middleware_upload,function(req,res){
	if(req.body.password == app_password){
			var data = {
			title: req.body.title,
			description: req.body.description,
			pricing:req.body.pricing
		};
		Product.update({"_id": req.params.id},data, function(product){
			res.redirect("/menu");
		})

	}else{
		res.redirect("/");
	}

});


//ADMINISTRADOR

app.post('/admin',function(req,res){
	if(req.body.password == app_password){
		Product.find(function(error,documento){
		if(error){ console.log(error); }
		res.render("admin/index",{products: documento})

	});
	}else{
		res.redirect("/");
	}
});

app.get('/admin',function(req,res){
	res.render("admin/form")
});


//Ruta donde se van a de finir los productos -> La acción se expresa 
app.post("/menu",middleware_upload,function(req,res){
	if(req.body.password == "app_password"){
		var data = {
			title: req.body.title,
			description: req.body.description,
			imageUrl: "data.png",
			pricing:req.body.pricing
		}
    
    	var product = new Product(data);
    if(req.file === undefined){
    	cloudinary.uploader.upload(req.file.path,function(result){
    		product.imageUrl = result.url;
    		product.save(function(err){
    			console.log(product);
    			res.redirect("/menu");
    		});
    	});
    }

    else{

		product.save(function(err){
			console.log(product);
			res.redirect("/menu");
		});
	  }
	}
	else{
		res.redirect("/");
		
	}

});

app.get("/menu/new",function(req,res){

	res.render("menu/new");

});

//ELIMINAR PRODUCTO

app.get("/menu/delete/:id",function(req,res){
	var id = req.params.id;

	Product.findOne({"_id": id },function(err,producto){
		res.render("menu/delete",{producto: producto});
	});

});

app.delete("/menu/:id",function(req,res){
	var id = req.params.id;
	if(req.body.password == "app_password"){
	  Product.remove({"_id": id },function(err){
			if(err){ console.log(err); }
			res.redirect("/menu");
		});

	}else{
		res.redirect("/");
	}

});



app.listen(8080);
