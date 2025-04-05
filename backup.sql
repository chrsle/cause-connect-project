PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            createdDate TEXT,
            title STRING NOT NULL,
            body TEXT NOT NULL,
            authorid INTEGER,
            FOREIGN KEY (authorid) REFERENCES users (id)
            );
INSERT INTO posts VALUES(3,'2025-03-30T00:44:09.284Z','Deez nuts','your mother',11);
INSERT INTO posts VALUES(8,'2025-03-31T02:40:44.087Z','Our Markdown Test',replace(replace('This is example **bold** content.\r\n\r\nAnd this is a new paragraph with *italic* content.\r\n\r\n- red\r\n- orange\r\n- black','\r',char(13)),'\n',char(10)),10);
INSERT INTO posts VALUES(9,'2025-03-31T02:49:57.665Z','deez nuts','wow',10);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER,
	"username"	STRING NOT NULL UNIQUE,
	"password"	STRING NOT NULL,
	"user_type"	STRING,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO users VALUES(3,'brad50','$2b$10$aYdmlBLAYx8ak9kYOCjIyO5Z9ZItBZLp6pn7s3/5QZYzPHWr5M91m',NULL);
INSERT INTO users VALUES(4,'wuphboy','$2b$10$96BCggPQFxR1VD8Of7kHO.glAukszJghgScTaKh1nF4t14E.8z1Yq',NULL);
INSERT INTO users VALUES(5,'meowman','$2b$10$oVoGjZzRJLFYSLXQVDVyPeo8uM/nWDXOhaH5j5VSHai93qRN4UqFO',NULL);
INSERT INTO users VALUES(6,'hello','$2b$10$aheET51kfwQ6Ni.CwH8NzORTwBtsuK7gGgbZvOv8.LUvsKq9gGo4K',NULL);
INSERT INTO users VALUES(7,'wuphman10','$2b$10$wfNftgdRzm6roUTyFNPuCepQDwHuAJEnkQVm1oOYOMuJ7ehNckzbq',NULL);
INSERT INTO users VALUES(8,'fsdg','$2b$10$yRUl2Z4UYjLEN6hu4XCCcOXrwW/fVqZkvDKDZCHFggEESiVcWLJ/m',NULL);
INSERT INTO users VALUES(9,'rwerew','$2b$10$/9RiyvI.3gaRQ8VEHSiLzu4.bCYA.kJIO4/COR9BGCD79O5ozx5Uy',NULL);
INSERT INTO users VALUES(10,'bigbooty','$2b$10$PPxY8LGDc37y0khkf9whIOsbnT.PPc1bJiKwzyen8rz4KHvZNEGM2','student');
INSERT INTO users VALUES(11,'katherine','$2b$10$RUe/b9OUA6emDCzAOGrf7ejXaxiAmqtNmIkeeB0IBQWTKj22rbxUu',NULL);
INSERT INTO users VALUES(12,'stevenvu','$2b$10$g0aO4s3LVJvteGd6a3s69OabVYP7EC0qIL7LvJM0P8YU7vcKKDc1a',NULL);
INSERT INTO users VALUES(13,'stevenvu7','$2b$10$K6HYLp9s8o6IFWdYPofUl.rAFvZACc/5ZGnkAv0moRMicJyNPafSa','student');
INSERT INTO users VALUES(14,'testing','$2b$10$fqSADGIojd9X2HGhxDDFOecom.Bg0WSDTCyQgsaVapBHgf.znIeb2','student');
INSERT INTO users VALUES(15,'testing1','$2b$10$vgXOQxuuFClseC4SBxszH.YOD6cobn6SBbzhxKxUj3Uc7ZRkHsMMi','student');
INSERT INTO users VALUES(16,'testing2','$2b$10$H1zXMQ6BbSZLa7cZ7AcNkuGIT5r.3uk8lo345XisYOTd5ZpCxlDiu','student');
INSERT INTO users VALUES(17,'testing3','$2b$10$hya4/KwVz2E/1RozWFAbVegtTAq8hS.uYoh0OB2pfLHEZcOkXuCN2','student');
INSERT INTO users VALUES(18,'testing4','$2b$10$Ur0WPrSW06S90ocdPufQNu9/8jVRAo0acozGNllSW2BXa7CmYUSwi','student');
INSERT INTO users VALUES(19,'testing10','$2b$10$Qx.iNefbkfuoYw0yJlcPtusUkmLK53V13x8mDpWELOBBdyDhz235e',NULL);
INSERT INTO users VALUES(20,'testing5','$2b$10$7OyRcTrhdEeYb2pCsU26YuRbypmq24Qt.IPVpeyFek3Fig.frAaOS',NULL);
INSERT INTO users VALUES(21,'testing6','$2b$10$XdKnoGXd40VTdV9f12vtFOhjAX/TQH6TPFQhOV6CSXE1ZjQkRcv/.','student');
INSERT INTO users VALUES(22,'testing7','$2b$10$OsYf31sQCuMWufgeoQ3s1Onfmte3nEfM3uoOeLs9Oo7UaO/S441NS','student');
INSERT INTO users VALUES(23,'testing8','$2b$10$KNYSQtb3g8k6wWGu1aOnOO6lA6RoWSQ3koBxoievDhj19fbAKpEdu','student');
INSERT INTO users VALUES(24,'testing9','$2b$10$glehhva2yv8mUnay28MvAeq2R7XJW67FBqsrrfcZJ9A9.5uoHKuRy','nonprofit');
INSERT INTO users VALUES(25,'testing11','$2b$10$EGyHQ0zKKfD9ODSSZzZAvOt9MAXbVYNsnvarAuWnceqMKAd9rUOLC','nonprofit');
INSERT INTO users VALUES(26,'testing12','$2b$10$P53kWCrcUgQ2i2x2lCww9uxn.0CPaa2izVR.GstmSPyok.nd2EKFS','nonprofit');
INSERT INTO users VALUES(27,'testing13','$2b$10$jh98FdXvCeiwwxN4qTPAhumTuiStZxQWupZ4m.bzwN6.czJq8FR.u','nonprofit');
INSERT INTO users VALUES(28,'testing14','$2b$10$EU9rJM.7EGTc2Qqjkl/5TO1gwC.pbqfYBbitQxb86g1zLj0uREZKy','nonprofit');
INSERT INTO users VALUES(29,'testing15','$2b$10$SaP/YWX/vkR5e9u0L/aksuBIvlnt5s9E0sI1rbLdToCT9l9CWSnxy','student');
INSERT INTO users VALUES(30,'penis','$2b$10$CY7/JUsN3i/vpQo5IDIgNecqh0eCWDmmBRoy9iVzdNNJUQ0VMmnJC','nonprofit');
INSERT INTO users VALUES(31,'testing16','$2b$10$rFoigfJU0hQKe.WS.otb6.ZHbpgeQBQGYfqgj2pEsasPZc/Psdzv6','student');
INSERT INTO users VALUES(32,'testing17','$2b$10$9yGr1FtwUtpm7inrA/EB1.n6KDgMW1mJVeYwZ5lcESaXqDMPhDihG','nonprofit');
INSERT INTO users VALUES(33,'testing18','$2b$10$eM8fVczJF5jZJM9kiwJMjOe428nraL1TqV7V4crvOgwA/pJFa0AtG','student');
INSERT INTO users VALUES(34,'testing20','$2b$10$lWK3m/NSySvQO31G81ArxOc.KuWnlD5X77tbRywSQzFzbigCWPgty','nonprofit');
INSERT INTO users VALUES(35,'testing21','$2b$10$JnkHg7az8jld32LedtcZZ.mW2UQkhFyDcCurGeFE5SWaUrUAK1nqC','nonprofit');
INSERT INTO users VALUES(36,'testing22','$2b$10$2SFcXGPKejhBP2lJ9R.vPOc3.f0IzuKUgvfIPaLVa0ucSSdxYAOuW','student');
INSERT INTO users VALUES(37,'testing23','$2b$10$9aNlgQpPi58IjQBq9rhpT.cN/iKtGg66N06FNJivmp1vwfV.94ph6','student');
CREATE TABLE IF NOT EXISTS "nonprofit_profiles" (
	"id"	INTEGER,
	"user_id"	INTEGER,
	"nonprofit_name"	TEXT,
	"location"	INTEGER,
	"category"	TEXT,
	"statement"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("user_id") REFERENCES "users"("id")
);
INSERT INTO nonprofit_profiles VALUES(1,24,'f','f','f',NULL);
INSERT INTO nonprofit_profiles VALUES(2,24,'f','f','f',NULL);
INSERT INTO nonprofit_profiles VALUES(3,24,'f','f','f',NULL);
INSERT INTO nonprofit_profiles VALUES(4,25,'Woaof','Hello','Why',NULL);
INSERT INTO nonprofit_profiles VALUES(5,26,'Woaof','Hello','Why',NULL);
INSERT INTO nonprofit_profiles VALUES(6,26,'Woaof','Hello','Why',NULL);
INSERT INTO nonprofit_profiles VALUES(7,26,'Woaof','Hello','Why',NULL);
INSERT INTO nonprofit_profiles VALUES(8,27,'fsd','sdf','sdfds','sdf');
INSERT INTO nonprofit_profiles VALUES(9,28,'Hello','From','the','other side');
INSERT INTO nonprofit_profiles VALUES(10,29,'Testing','if ','it','goes');
INSERT INTO nonprofit_profiles VALUES(11,32,'Weed','Basement','blah','Herro');
CREATE TABLE IF NOT EXISTS "student_profiles" (
	"id"	INTEGER,
	"user_id"	INTEGER UNIQUE,
	"full_name"	TEXT,
	"age"	INTEGER,
	"school"	TEXT,
	"bio"	TEXT,
	"interests"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("user_id") REFERENCES "users"("id")
);
INSERT INTO student_profiles VALUES(1,10,'Steven',20,'GGHS','I like cats','Animals, Sports&Fitness, Technology');
INSERT INTO student_profiles VALUES(2,13,'Steven',20,'HDGD','Pooper',NULL);
INSERT INTO student_profiles VALUES(3,14,'Booty',34,'Deez Nuts Highschools','I like milk...',NULL);
INSERT INTO student_profiles VALUES(4,15,'brad',28,'fsd','sgd',NULL);
INSERT INTO student_profiles VALUES(5,17,'Bigboy',20,'MEOW','I like to take long walks on the ocean because they help me to realize that I am alone in this world...',NULL);
INSERT INTO student_profiles VALUES(6,18,'fsdfs','sdfds','fsdf','sdfsd',NULL);
INSERT INTO student_profiles VALUES(7,16,'Smelly','Poop','blahblahblha','Hello from the other side',NULL);
INSERT INTO student_profiles VALUES(8,23,'Fish',22,'42','424',NULL);
INSERT INTO student_profiles VALUES(9,27,'fsd',34,'sfd','sfsdfds',NULL);
INSERT INTO student_profiles VALUES(10,29,'j',3,'f','again','Animals, Education, Sports&Fitness');
INSERT INTO student_profiles VALUES(11,31,'Steven',24,'ffas','Hello','Sports&Fitness, Technology');
INSERT INTO student_profiles VALUES(12,33,'Hello',2,'f','f','');
INSERT INTO student_profiles VALUES(13,34,'fd',2,'rse','fsd','Environment, Health&Wellness');
INSERT INTO student_profiles VALUES(14,35,'Keaton',20,'GGHS','I like asians.','Animals, Education, Health&Wellness, Sports&Fitness, Technology');
INSERT INTO student_profiles VALUES(15,36,'Steven',20,'GGHS','Hello from the other side','Animals, Engineering, Sports&Fitness, Technology');
INSERT INTO student_profiles VALUES(16,37,'Steven',20,'IVC','kifmdkgmdk','Animals, Engineering, Science');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('posts',9);
INSERT INTO sqlite_sequence VALUES('users',37);
INSERT INTO sqlite_sequence VALUES('nonprofit_profiles',11);
INSERT INTO sqlite_sequence VALUES('student_profiles',16);
COMMIT;
