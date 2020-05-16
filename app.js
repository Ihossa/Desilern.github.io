var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var cons = require("consolidate");
var app = express();
let ejs = require('ejs');
var pg = require("pg");
var pgp = require("pg-promise")(/*options*/);
var db = pgp("postgres://postgres:1234@localhost/desilernDB");




app.set("view engine", "ejs");
app.use("/public", express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", function(req, res) {
	res.render("index");
	
})
app.get("/userPage", function(req, res) {
	res.render("userPage");
})
app.get("/Course", function(req, res) {
	
	db.one('SELECT "Teacher".teacher_name, "School".title_school,"Course".title, "Course".type,"Course".vacancines, "Course".price, "Course".start_date, "Course".finish_date, "Course".lesson_num, "Course".description, "Course".photo FROM "Course"  INNER JOIN "Teacher" ON "Course".teacher = "Teacher".id_teacher INNER JOIN"School" ON "Course".school = "School".id_school WHERE"Course".id_course = 1;')
    	.then(function (course) {
        	console.log("DATA:", course); 
        	res.render("coursePage",{idCourse:course.id_course, title:course.title, type:course.type, teacher: course.teacher_name, school:course.title_school, vacancines:course.vacancines, price:course.price, startDate:course.start_date, finishDate:course.finish_date, lesNum:course.lesson_num, description:course.description});
		})		
	})	        

app.post("/welcome", function(req, res){
	if(req.body.isAdmin === "on"){
		db.one('SELECT * FROM "Admin" WHERE login = $1 AND pasword = $2', 
			[req.body.login, req.body.password])
	    .then(function (admin) {
	        console.log("DATA:", admin);
	        db.one('SELECT * FROM "Admin" WHERE id_admin = $1',[admin.id_admin])
    		.then(function (admin) {
        	console.log("DATA:", admin.login); 
        	res.render("userPage",{ idAdmin:admin.id_admin, adminLog:admin.login, adminPass:admin.pasword, adminName:admin.admin_name, adminMail: admin.mail, adminPhone:admin.phone});
        	
		    }) 
    	})

	    .catch(function (error) {
	        console.log("ERROR:", error);
	    });

	    }
	else{
		db.one('SELECT * FROM "User" WHERE login = $1 AND pasword = $2', 
			[req.body.login, req.body.password])
	    .then(function (user) {
	        console.log("DATA:", user);
	        db.one('SELECT * FROM "User" WHERE id_user = $1',[user.id_user])
    		.then(function (user) {
        	console.log(user.login);
        	res.render("welcome",{ idAdmin:user.id_user, adminLog:user.login, adminPass:user.pasword, adminName:user.user_name, adminMail: user.mail, adminPhone:user.phone});
		    
		    })		       
		})
		.catch(function (error) {
	        console.log("ERROR:", error);
	    });
	}		
})
app.post("/regist", function(req, res){
		if(req.body.login === ''|| req.body.password === ''|| req.body.name === ''|| req.body.mail === ''|| req.body.phone === '' ){console.log("поле пустое")}
			else{
				db.one('INSERT INTO "User"(login, pasword, user_name, mail, phone)VALUES ($1, $2, $3, $4, $5);', 
					[req.body.login, req.body.password, req.body.name, req.body.mail, req.body.phone ])
	    		.then(function (user) { 			       
				})
				.catch(function (error) {
	    		    console.log("ERROR:", error);
	    		});
	    	}		
})

app.listen(3000);
console.log("Succes");



//		db.one('SELECT * FROM "User" WHERE login = $1 AND pasword = $2', 
//			[req.body.login, req.body.password])
//	    .then(function (user) {
//	        console.log("DATA:", admin);
//	        db.one('SELECT * FROM "User" WHERE id_user = $1',[user.id_user])
//    		.then(function (user) {
//        	console.log("DATA:", user.login); 
//        	res.render("userPage",{userLog:user.login, userPass:user.pasword, userName:user.user_name, userMail: user.mail, userPhone:user.phone});
//		    })		       
//		 })
