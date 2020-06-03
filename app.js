var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var cons = require("consolidate");
var app = express();
let ejs = require('ejs');
var pg = require("pg");
var pgp = require("pg-promise")(/*options*/);
var nodemailer = require('nodemailer');
var db = pgp("postgres://postgres:1234@localhost/desilernDB");




app.set("view engine", "ejs");
app.use("/public", express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", function(req, res) {
	res.render("index");
	
})
app.get("/userPage", function(req, res) {
	console.log(req.query.user_id)
	db.manyOrNone ('SELECT "History".id_history, "History".users, "History".status, "Course".title FROM public."History", public."Course" WHERE "Course".id_course = "History".course AND "History".users = $1 ORDER BY "History".id_history;',[req.query.user_id])
	    .then(function (history){
	    	let arr = history;
	    	console.log(arr);
	    	res.render("userPage",{data:arr});
	    });
})

app.post("/feedBack", function(req, res) {
	console.log(req.body);
	let transporter = nodemailer.createTransport({
	  service:'gmail',
	  auth: {
	    user: "desilernofficial@gmail.com",
	    pass: "desilern17"
	  }
	});

	let mailOptions = {
		from:'desilernofficial@gmail.com',
		to: 'ihossa17@gmail.com',
		subject: req.body.subject,
		text: `${req.body.message}, відправник ${req.body.mail}`
	};

	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			console.log(error);
		} else {
			res.render("index");
		}
	})
})



app.post("/userPage", function(req, res) {
	db.manyOrNone ('SELECT "History".id_history, "History".users, "History".status, "Course".title FROM public."History", public."Course" WHERE "Course".id_course = "History".course AND "History".users = $1 ORDER BY "History".id_history;',[req.body.user_id])
	    .then(function (history){
	    	let arr = history;
	    	console.log(arr);
	    	res.render("userPage",{data:arr});
	    });
})

app.get("/uxDesign", function(req, res) {
	
	db.one('SELECT "Teacher".teacher_name, "School".title_school,"Course".id_course,"Course".title, "Course".type,"Course".vacancines, "Course".price, "Course".start_date, "Course".finish_date, "Course".lesson_num, "Course".description, "Course".photo FROM "Course"  INNER JOIN "Teacher" ON "Course".teacher = "Teacher".id_teacher INNER JOIN"School" ON "Course".school = "School".id_school WHERE"Course".id_course = 1;')
    	.then(function (course) {
        	res.render("coursePage",{idCourse:course.id_course, title:course.title, type:course.type, teacher: course.teacher_name, school:course.title_school, vacancines:course.vacancines, price:course.price, startDate:course.start_date, finishDate:course.finish_date, lesNum:course.lesson_num, description:course.description});
		})		
	})	        

app.get("/uiDesign", function(req, res) {
	
	db.one('SELECT "Teacher".teacher_name, "School".title_school,"Course".id_course,"Course".title, "Course".type,"Course".vacancines, "Course".price, "Course".start_date, "Course".finish_date, "Course".lesson_num, "Course".description, "Course".photo FROM "Course"  INNER JOIN "Teacher" ON "Course".teacher = "Teacher".id_teacher INNER JOIN"School" ON "Course".school = "School".id_school WHERE"Course".id_course = 2;')
    	.then(function (course) {
        	res.render("coursePage",{idCourse:course.id_course, title:course.title, type:course.type, teacher: course.teacher_name, school:course.title_school, vacancines:course.vacancines, price:course.price, startDate:course.start_date, finishDate:course.finish_date, lesNum:course.lesson_num, description:course.description});
		})		
	})

app.get("/basicDesign", function(req, res) {
	
	db.one('SELECT "Teacher".teacher_name, "School".title_school,"Course".id_course,"Course".title, "Course".type,"Course".vacancines, "Course".price, "Course".start_date, "Course".finish_date, "Course".lesson_num, "Course".description, "Course".photo FROM "Course"  INNER JOIN "Teacher" ON "Course".teacher = "Teacher".id_teacher INNER JOIN"School" ON "Course".school = "School".id_school WHERE"Course".id_course = 3;')
    	.then(function (course) { 
        	res.render("coursePage",{idCourse:course.id_course, title:course.title, type:course.type, teacher: course.teacher_name, school:course.title_school, vacancines:course.vacancines, price:course.price, startDate:course.start_date, finishDate:course.finish_date, lesNum:course.lesson_num, description:course.description});
		})		
	})

app.post("/welcome", function(req, res){
	if(req.body.isAdmin === "on"){
		db.one('SELECT * FROM "Admin" WHERE login = $1 AND pasword = $2', 
			[req.body.login, req.body.password])
	    .then(function (admin) {
        	if(typeof(admin) === 'object'){
        		db.manyOrNone ('SELECT "History".status, "Course".title, "User".login, "History".id_history FROM public."History", public."Course", public."User" WHERE "Course".id_course = "History".course AND"User".id_user = "History".users;')
	    		.then(function (history){
	    			let arr = history;
	    			console.log(arr);
	    			res.render("adminPage",{history:arr});
	    		});
        	}
    	})

	    .catch(function (error) {
	        console.log("ERROR:", error);
	    });

	    }
	else{
		db.one('SELECT * FROM "User" WHERE login = $1 AND pasword = $2', 
			[req.body.login, req.body.password])
	    	.then(function (user) {
	    	    db.one('SELECT * FROM "User" WHERE id_user = $1',[user.id_user])
    			.then(function (user) {
        		res.render("welcome",{ idAdmin:user.id_user, adminLog:user.login, adminPass:user.pasword, adminName:user.user_name, adminMail: user.mail, adminPhone:user.phone});   
			    })		       
			})
		
		
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
////////////////////////////////////////admin history//////////////////////////////////////
app.post("/historyInf", function(req, res){
		db.manyOrNone ('SELECT "History".status, "Course".title, "User".login, "History".id_history FROM public."History", public."Course", public."User" WHERE "Course".id_course = "History".course AND"User".id_user = "History".users;')
	    		.then(function (history){
	    			let arr = history;
	    			console.log(arr);
	    			res.render("adminPage",{history:arr});
	    		});
})


app.post("/serchHist", function(req, res){
		db.manyOrNone ('SELECT "History".status, "Course".title, "User".login, "History".id_history FROM public."History", public."Course", public."User" WHERE "Course".id_course = "History".course AND"User".id_user = "History".users AND"User".login = $1;',[req.body.search])
	    .then(function (history){
	    	let arr = history;
	    	res.render("adminPage",{history:arr});
	    });
})

app.post("/payOn", function(req, res){
		db.manyOrNone (`SELECT "History".status, "Course".title, "User".login, "History".id_history FROM public."History", public."Course", public."User" WHERE "Course".id_course = "History".course AND"User".id_user = "History".users AND"History".status = 'оплачено';`)
	    .then(function (history){
	    	let arr = history;
	    	res.render("adminPage",{history:arr});
	    });
})
app.post("/payOf", function(req, res){
		db.manyOrNone (`SELECT "History".status, "Course".title, "User".login, "History".id_history FROM public."History", public."Course", public."User" WHERE "Course".id_course = "History".course AND"User".id_user = "History".users AND"History".status = 'не оплачено';`)
	    .then(function (history){
	    	let arr = history;
	    	res.render("adminPage",{history:arr});
	    });
})

app.post("/changeStatus", function(req, res){
		console.log(req.body.select[0]);
		console.log(req.body.select[1]);
		db.one ('SELECT "History".status, "Course".title, "User".login, "History".id_history FROM public."History", public."Course", public."User" WHERE "Course".id_course = "History".course AND "User".id_user = "History".users AND "User".login = $1 AND "Course".title = $2;',[req.body.select[0],req.body.select[1]])
	    .then(function (history){
	    	let arr = [];
	    	arr.push(history);
	    	if(history.status === 'оплачено'){
	    	 db.manyOrNone(`UPDATE "History" SET status = 'не оплачено' WHERE "History".id_history = $1;`,[history.id_history])
	    	 .then(function (history) {	
	    	 	db.manyOrNone ('SELECT "History".status, "Course".title, "User".login, "History".id_history FROM public."History", public."Course", public."User" WHERE "Course".id_course = "History".course AND"User".id_user = "History".users;')
	    			.then(function (history){
	    				let arr = history;
	    				console.log(arr);
	    				res.render("adminPage",{history:arr});
	    			});
	    	 });		
	    	 }else{
	    	 	db.manyOrNone(`UPDATE "History" SET status = 'оплачено' WHERE "History".id_history = $1;`,[history.id_history])
	    	 	.then(function (history) {	
	    	 	db.manyOrNone ('SELECT "History".status, "Course".title, "User".login, "History".id_history FROM public."History", public."Course", public."User" WHERE "Course".id_course = "History".course AND"User".id_user = "History".users;')
	    			.then(function (history){
	    				let arr = history;
	    				console.log(arr);
	    				res.render("adminPage",{history:arr});
	    			});
	    	 });
	    	 }
	    });
})
////////////////////////////////////////////reserve vacancines////////////////////////
app.get("/Course", function(req, res){
	db.oneOrNone('SELECT id_history, users, course, status FROM "History" Where "History".users = $1 AND "History".course = $2;',[req.query.user, req.query.course])
	.then(function (history) {
		if(history === null){
			db.oneOrNone('UPDATE "Course" SET vacancines = vacancines-1 WHERE "Course".id_course = $1;', 
			[req.query.course])
			.then(function (course) {
    			db.oneOrNone(`INSERT INTO "History"(users, course, status)VALUES ( $1, $2, 'не оплачено');`, 
				[req.query.user, req.query.course])
			}).then(function (course) {
    			db.one('SELECT "Teacher".teacher_name, "School".title_school,"Course".id_course,"Course".title, "Course".type,"Course".vacancines, "Course".price, "Course".start_date, "Course".finish_date, "Course".lesson_num, "Course".description, "Course".photo FROM "Course"  INNER JOIN "Teacher" ON "Course".teacher = "Teacher".id_teacher INNER JOIN"School" ON "Course".school = "School".id_school WHERE"Course".id_course = $1;',[req.query.course])
    			.then(function (course) {
    		    	res.render("coursePage",{idCourse:course.id_course, title:course.title, type:course.type, teacher: course.teacher_name, school:course.title_school, vacancines:course.vacancines, price:course.price, startDate:course.start_date, finishDate:course.finish_date, lesNum:course.lesson_num, description:course.description});
				})
			})

			
		}else{
			db.one('SELECT "Teacher".teacher_name, "School".title_school,"Course".id_course,"Course".title, "Course".type,"Course".vacancines, "Course".price, "Course".start_date, "Course".finish_date, "Course".lesson_num, "Course".description, "Course".photo FROM "Course"  INNER JOIN "Teacher" ON "Course".teacher = "Teacher".id_teacher INNER JOIN"School" ON "Course".school = "School".id_school WHERE"Course".id_course = $1;',[req.query.course])
    			.then(function (course) {
    				let vac = "Місце заброньовоно";
    		    	res.render("coursePage",{idCourse:course.id_course, title:course.title, type:course.type, teacher: course.teacher_name, school:course.title_school, vacancines:vac, price:course.price, startDate:course.start_date, finishDate:course.finish_date, lesNum:course.lesson_num, description:course.description});
				})
		}				
    })
})
///////////////////////////////////////admin users///////////////////////////////////////
app.post("/usersInf", function(req, res){
		db.manyOrNone ('SELECT * FROM "User";')
	    		.then(function (user){
	    			let arr = user;
	    			res.render("adminPage",{history:arr});
	    		});
})
app.post("/searchUser", function(req, res){
	db.manyOrNone ('SELECT * FROM "User" WHERE "User".login = $1;',[req.body.userLog])
	    		.then(function (user){
	    			let arr = user;
	    			res.render("adminPage",{history:arr});
	    		});
})
app.post("/delUser", function(req, res){
	db.manyOrNone ('DELETE FROM "User" WHERE "User".login = $1;',[req.body.userLog])
	    		.then(function (us){
	    			db.manyOrNone ('SELECT * FROM "User";')
	    			.then(function (user){
	    				let arr = user;
	    				res.render("adminPage",{history:arr});
	    			});
	    		});
})
////////////////////////////////admin school///////////////////////////
app.post("/schoolInf", function(req, res){
	db.manyOrNone ('SELECT "Admin".login, "School".id_school, "School".title_school, "School".adres FROM public."School", public."Admin" WHERE "Admin".id_admin = "School".admin ORDER BY "School".id_school;')
	   	.then(function (user){
	   		let arr = user;
	   		res.render("adminPage",{history:arr});
	   	});
})
app.post("/searchSchool", function(req, res){
	db.manyOrNone ('SELECT "Admin".login, "School".id_school, "School".title_school, "School".adres FROM public."School", public."Admin" WHERE "Admin".id_admin = "School".admin AND "Admin".login = $1 ORDER BY "School".id_school;',[req.body.select])
	   	.then(function (user){
	   		let arr = user;
	   		//console.log(req.body.select);
	   		res.render("adminPage",{history:arr});
	   	});
})
app.post("/addSchool", function(req, res){
	//console.log(req.body);
	db.one ('SELECT id_admin FROM "Admin" WHERE "Admin".login = $1;',[req.body.select])
	   	.then(function (idAdmin){
	   		db.oneOrNone ('INSERT INTO "School"( title_school, adres, admin) VALUES ( $1, $2, $3);',[req.body.nameSchool, req.body.adresSchool, idAdmin.id_admin])
	   		.then(function (idAdmin){
	   			db.manyOrNone ('SELECT "Admin".login, "School".id_school, "School".title_school, "School".adres FROM public."School", public."Admin" WHERE "Admin".id_admin = "School".admin ORDER BY "School".id_school;')
	   				.then(function (user){
	   					let arr = user;
	   					res.render("adminPage",{history:arr});
	   				});
	   		})
	   	});
	
})
app.post("/delSchool", function(req, res){
	//console.log(req.body);
	db.oneOrNone ('DELETE FROM "School" WHERE "School".title_school = $1 ;',[req.body.select])
	   		.then(function (idAdmin){
	   			db.manyOrNone ('SELECT "Admin".login, "School".id_school, "School".title_school, "School".adres FROM public."School", public."Admin" WHERE "Admin".id_admin = "School".admin ORDER BY "School".id_school;')
	   				.then(function (user){
	   					let arr = user;
	   					res.render("adminPage",{history:arr});
	   				});
	   		})
	
})
////////////////////////////// admin course//////////////////////////////////////////////////
app.post("/coursesInf", function(req, res){
	db.manyOrNone ('SELECT "Course".id_course, "Course".title, "Course".type, "Course".vacancines, "Course".start_date, "Course".price, "Course".finish_date, "Course".lesson_num, "Course".description, "Teacher".teacher_name, "School".title_school FROM public."Course", public."Teacher", public."School" WHERE "Teacher".id_teacher = "Course".teacher AND "School".id_school = "Course".school ORDER BY "Course".id_course; ')
	   	.then(function (course){
	   		let arr = course;
	   		res.render("adminPage",{history:arr});
	   	});
})
app.post("/searchCourse", function(req, res){
	db.manyOrNone ('SELECT "Course".id_course, "Course".title, "Course".type, "Course".vacancines, "Course".start_date, "Course".price, "Course".finish_date, "Course".lesson_num, "Course".description, "Teacher".teacher_name, "School".title_school FROM public."Course", public."Teacher", public."School" WHERE "Teacher".id_teacher = "Course".teacher AND "School".id_school = "Course".school AND "Course".title = $1 ORDER BY "Course".id_course;',[req.body.title])
	   	.then(function (course){
	   		let arr = course;
	   		res.render("adminPage",{history:arr});
	   	});
})
app.post("/searchCourseTeach", function(req, res){
	db.manyOrNone ('SELECT "Course".id_course, "Course".title, "Course".type, "Course".vacancines, "Course".start_date, "Course".price, "Course".finish_date, "Course".lesson_num, "Course".description, "Teacher".teacher_name, "School".title_school FROM public."Course", public."Teacher", public."School" WHERE "Teacher".id_teacher = "Course".teacher AND "School".id_school = "Course".school AND "Teacher".teacher_name = $1 ORDER BY "Course".id_course;',[req.body.select])
	   	.then(function (course){
	   		let arr = course;
	   		res.render("adminPage",{history:arr});
	   	});
})
app.post("/addCourse", function(req, res){
	console.log(req.body)
	db.oneOrNone ('SELECT id_teacher FROM "Teacher" WHERE "Teacher".teacher_name = $1 ;',[req.body.select[1]])
	   	.then(function (teacher){
	   		db.oneOrNone ('SELECT id_school FROM "School" WHERE title_school = $1 ;',[req.body.select[2]])
	   			.then(function (school){
	   			console.log(teacher.id_teacher);
	   			console.log(school.id_school);
	   			db.oneOrNone ('INSERT INTO "Course"( title, type, teacher, school, vacancines, price, start_date, finish_date, lesson_num, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',[req.body.title, req.body.select[0], teacher.id_teacher, school.id_school, req.body.vacancines, req.body.price, req.body.start_date, req.body.finish_date, req.body.lesson_num, req.body.description ])
	   			.then(function (school){
	   				db.manyOrNone ('SELECT "Course".id_course, "Course".title, "Course".type, "Course".vacancines, "Course".start_date, "Course".price, "Course".finish_date, "Course".lesson_num, "Course".description, "Teacher".teacher_name, "School".title_school FROM public."Course", public."Teacher", public."School" WHERE "Teacher".id_teacher = "Course".teacher AND "School".id_school = "Course".school ORDER BY "Course".id_course;')
	   				.then(function (course){
	   					let arr = course;
	   					res.render("adminPage",{history:arr});
	   				});
	   			})
	   		});
	   	});
})
app.post("/delCourse", function(req, res){
	//console.log(req.body);
	db.oneOrNone ('DELETE FROM "Course" WHERE "Course".title = $1 ;',[req.body.select])
	   	.then(function (idAdmin){
	   		db.manyOrNone ('SELECT "Course".id_course, "Course".title, "Course".type, "Course".vacancines, "Course".start_date, "Course".price, "Course".finish_date, "Course".lesson_num, "Course".description, "Teacher".teacher_name, "School".title_school FROM public."Course", public."Teacher", public."School" WHERE "Teacher".id_teacher = "Course".teacher AND "School".id_school = "Course".school ORDER BY "Course".id_course; ')
	   		.then(function (course){
	   			let arr = course;
	   			res.render("adminPage",{history:arr});
	   		});
	   	})
	
})
///////////////////////////////////////////////////admin teacher//////////////////////////////////////
app.post("/teachersInf", function(req, res){
	db.manyOrNone ('SELECT id_teacher, teacher_name, mail, phone, specialty, description FROM "Teacher" ORDER BY "Teacher".id_teacher ;')
	   	.then(function (course){
	   		let arr = course;
	   		res.render("adminPage",{history:arr});
	   	});
})
app.post("/searchTeacher", function(req, res){
	db.manyOrNone ('SELECT id_teacher, teacher_name, mail, phone, specialty, description FROM "Teacher" WHERE "Teacher".teacher_name = $1 ORDER BY "Teacher".id_teacher ;', [req.body.select])
	   	.then(function (course){
	   		let arr = course;
	   		res.render("adminPage",{history:arr});
	   	});
})
app.post("/addTeacher", function(req, res){
	db.oneOrNone ('INSERT INTO "Teacher"(teacher_name, mail, phone, specialty, description) VALUES ($1, $2, $3, $4, $5);', [req.body.teacher_name, req.body.mail, req.body.phone, req.body.specialty, req.body.description])
	   	.then(function (course){
	   		db.manyOrNone ('SELECT id_teacher, teacher_name, mail, phone, specialty, description FROM "Teacher" ORDER BY "Teacher".id_teacher ;')
	   		.then(function (course){
	   			let arr = course;
	   			res.render("adminPage",{history:arr});
	   		});
	   	});
})

app.post("/delTeacher", function(req, res){
	db.oneOrNone ('DELETE FROM "Teacher" WHERE "Teacher".teacher_name = $1 ;;', [req.body.select])
	   	.then(function (course){
	   		db.manyOrNone ('SELECT id_teacher, teacher_name, mail, phone, specialty, description FROM "Teacher" ORDER BY "Teacher".id_teacher ;')
	   		.then(function (course){
	   			let arr = course;
	   			res.render("adminPage",{history:arr});
	   		});
	   	});
})

///////////////////////////////////////////admin admin//////////////////////////////////////////
app.post("/adminInf", function(req, res){
	db.manyOrNone ('SELECT id_admin, login, pasword, admin_name, mail, phone FROM "Admin" ORDER BY "Admin".id_admin ;')
	   	.then(function (admin){
	   		let arr = admin;
	   		res.render("adminPage",{history:arr});
	   	});
})
app.post("/addAdmin", function(req, res){
	db.oneOrNone ('INSERT INTO "Admin"( login, pasword, admin_name, mail, phone) VALUES ($1, $2, $3, $4, $5);', [req.body.login, req.body.pasword, req.body.admin_name, req.body.mail, req.body.phone])
	   	.then(function (course){
	   		db.manyOrNone ('SELECT id_admin, login, pasword, admin_name, mail, phone FROM "Admin" ORDER BY "Admin".id_admin ;')
	   		.then(function (admin){
	   			let arr = admin;
	   			res.render("adminPage",{history:arr});
	   		});
	   	});
})
app.post("/delAdmin", function(req, res){
	console.log(req.body.select);
	if(req.body.select === 'Igres'){

		db.manyOrNone ('SELECT id_admin, login, pasword, admin_name, mail, phone FROM "Admin" ORDER BY "Admin".id_admin ;')
	   	.then(function (admin){
	   		let arr = admin;
	   		res.render("adminPage",{history:arr});
	   	});
	   }else{
	   	db.oneOrNone ('DELETE FROM "Admin" WHERE "Admin".login = $1;', [req.body.select])
	   	.then(function (course){
	   		db.manyOrNone ('SELECT id_admin, login, pasword, admin_name, mail, phone FROM "Admin" ORDER BY "Admin".id_admin ;')
	   		.then(function (admin){
	   			let arr = admin;
	   			res.render("adminPage",{history:arr});
	   		});
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
