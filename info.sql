DROP DATABASE IF EXISTS cars_db;
  CREATE DATABASE lamasocial;

DROP TABLE IF EXISTS users;
CREATE TABLE users(
     user_id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     username VARCHAR(50) NOT NULL,
     user_email VARCHAR(50) UNIQUE NOT NULL,
     password VARCHAR(30) NOT NULL
);

CREATE TABLE likes(
     like_id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     user_id VARCHAR[] UNIQUE,
     post_id VARCHAR UNIQUE, 
     likes INT DEFAULT 0

);


CREATE TABLE posts(
     post_id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     user_id VARCHAR UNIQUE NOT NULL REFERENCES users(user_id)  ON DELETE CASCADE,
     filename varchar,
     size INT,
     mimetype VARCHAR,
     uploaded_time TIMESTAMP(0) DEFAULT current_timestamp


);

CREATE TABLE avatar(
     avatar_id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     user_id VARCHAR UNIQUE NOT NULL REFERENCES users(user_id)  ON DELETE CASCADE,
     filename varchar,
     avatar_url VARCHAR, 
     size INT,
     mimetype VARCHAR

);

CREATE TABLE cover(
     cover_id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     user_id VARCHAR UNIQUE NOT NULL REFERENCES users(user_id)  ON DELETE CASCADE,
     filename varchar,
     cover_url VARCHAR, 
     size INT,
     mimetype VARCHAR

);


CREATE TABLE jwt(
     user_id VARCHAR UNIQUE NOT NULL,
     username VARCHAR(50) UNIQUE NOT NULL,
     profile_img VARCHAR NOT NULL,
     token VARCHAR
     
);


--------------
--------------

ALTER TABLE users ADD CONSTRAINT fk_user_email
FOREIGN KEY(user_email_id) 
	  REFERENCES emails(id);
--

ALTER TABLE users ADD CONSTRAINT fk_users_com
FOREIGN KEY(company_id) 
    REFERENCES company(company_id);

--

CREATE TABLE emails(
     id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     title VARCHAR(50) NOT NULL
     
);

ALTER TABLE emails ADD CONSTRAINT fk_company_email
FOREIGN KEY(user_email_id) 
	  REFERENCES emails(id);


CREATE TABLE company(
     company_id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     company_title VARCHAR(50) NOT NULL,
     company_email_id VARCHAR NOT NULL,
     company_address VARCHAR NOT NULL,
     created_by VARCHAR NOT NULL,
     isDeleted BOOLEAN NOT NULL DEFAULT false,

     CONSTRAINT fk_company_email
       FOREIGN KEY(company_email_id) 
	  REFERENCES emails(id),

     CONSTRAINT fk_company_cr_by
       FOREIGN KEY(created_by) 
	  REFERENCES users(user_id)
     
);

-- ALTER TABLE company ADD CONSTRAINT fk_company_cr_by
-- FOREIGN KEY(created_by) 
-- 	  REFERENCES users(user_id);


CREATE TABLE cars(
     car_id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     car_title VARCHAR(50) NOT NULL,
     car_brand VARCHAR(50) NOT NULL,
     car_price VARCHAR NOT NULL,
     car_color VARCHAR(50) NOT NULL,
     company_id VARCHAR NOT NULL,
     created_by VARCHAR NOT NULL,
     isDeleted BOOLEAN NOT NULL DEFAULT false,

     CONSTRAINT fk_company_id
       FOREIGN KEY(company_id) 
	  REFERENCES company(company_id),

     CONSTRAINT fk_company_cr_by
       FOREIGN KEY(created_by) 
	  REFERENCES users(user_id)
     
);

CREATE TABLE customers(
     customer_id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     user_id VARCHAR NOT NULL,
     car_id VARCHAR NOT NULL,
     company_id VARCHAR NOT NULL,
     created_at DATE NOT NULL DEFAULT CURRENT_DATE,
     isDeleted BOOLEAN NOT NULL DEFAULT false,

     CONSTRAINT fk_customers_users
       FOREIGN KEY(user_id) 
	  REFERENCES users(user_id),

     CONSTRAINT fk_customers_car
       FOREIGN KEY(car_id) 
	  REFERENCES cars(car_id),

     CONSTRAINT fk_customers_company
       FOREIGN KEY(company_id) 
	  REFERENCES company(company_id)

     
);


CREATE TABLE session(
     session_id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     user_id VARCHAR NOT NULL,
     start_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
     end_at TIMESTAMP(0),

     CONSTRAINT fk_customers_users
       FOREIGN KEY(user_id) 
	  REFERENCES users(user_id)
     
);



--Guide draft DATE + TIME without miliseconds

  DROP TABLE users;
CREATE TABLE users(
     session_id VARCHAR UNIQUE NOT NULL DEFAULT gen_random_uuid(),
     user_name VARCHAR NOT NULL,
     start_at TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
     end_at TIMESTAMP(0) CURRENT_TIMESTAMP
     
);

INSERT INTO users(user_name) VALUES ('someone');


--Increase the length of varchar

 ALTER TABLE users ALTER user_password TYPE VARCHAR;

 --

SELECT id FROM emails WHERE title = $1, [user_email]


--

INSERT INTO users(user_name, user_role, user_email_id,
       user_age,
      user_password) VALUES('Sarvar', 'admin', '7dcdff16-f104-4626-b6c2-54f88d1add50', 24, '2020i');


INSERT INTO emails(title) VALUES('sarvar@gmail.com');

--

CREATE TABLE jwt(
     user_id VARCHAR UNIQUE NOT NULL,
     username VARCHAR(50) NOT NULL,
     token VARCHAR
     
);


--

ALTER TABLE users ALTER COLUMN user_role DROP NOT NULL;


--

ALTER TABLE company ADD UNIQUE(company_title);

ALTER TABLE cars ADD UNIQUE(car_title);

--


UPDATE cars SET 
      (car_title ='fdsfdasf', car_brand='adfadsf', car_price='adfadsf', car_color='adsfdsaf', company_id='asdfsdf' where car_id='2bfccc8a-dd09-4cc8-a80e-380e2a906624');


--

ALTER TABLE company DROP CONSTRAINT fk_company_email;


DELETE FROM users where company_id="35272cba-aaf9-4abe-848d-9aad8c6946da";



--APIS

SELECT
	c.customer_id,
	c.first_name customer_first_name,
	c.last_name customer_last_name,
	s.first_name staff_first_name,
	s.last_name staff_last_name,
	amount,
	payment_date
FROM
	customer c
INNER JOIN payment p 
    ON p.customer_id = c.customer_id
INNER JOIN staff s 
    ON p.staff_id = s.staff_id
ORDER BY payment_date;

-- API 1 

SELECT 
u.*,
c.car_title,
com.company_title
FROM cars c
INNER JOIN company com
ON c.company_id = com.company_id  
INNER JOIN users u
ON u.company_id = com.company_id
WHERE u.user_id = 'ed2aef7d-2bb4-4087-97ce-732ac9158ca9';





-- API 2 ishladi

SELECT
u.user_id,
u.user_name,
u.user_role,
u.user_age,
u.user_password,
u.user_email_id,
s.start_at,
s.end_at
FROM session s
JOIN users u 
ON u.user_id = s.user_id
WHERE s.user_id = $1

--API 3 ishladi


SELECT 
*
FROM 
users
WHERE company_id = '5708b5d7-e39e-44fd-8a71-af2dc723d4aa';

-- API 4 ishladi

SELECT * 
FROM cars
WHERE company_id = '5708b5d7-e39e-44fd-8a71-af2dc723d4aa';

-- API 5  ishladi

SELECT
c.*,
e.title
FROM company c
JOIN emails e
ON c.company_email_id = e.id
WHERE c.company_email_id = 'f8c89f29-6d82-48f3-bb1c-2c5453100328';

-- API 6 ishladi

SELECT 
c.car_title,
com.company_title
FROM cars c
JOIN company com
ON c.company_id = com.company_id
WHERE c.car_id = '264380af-f588-4323-81d1-c028b71e5dde';



----

SELECT
u.user_name,
u.user_email_id,
e.title
FROM users u 
JOIN emails e
ON u.user_email_id = e.id
WHERE u.user_id ='24edc3bb-f98f-44f3-968c-0bd32f20f36b';

SELECT 
com.company_title,
car.car_title,
car.car_id,
e.title AS company_email
FROM company com
JOIN cars car 
ON com.company_id = car.company_id
JOIN emails e
ON e.id = com.company_email_id
WHERE car.company_id = '48e53fde-66ad-4660-8540-ea8683ac70f9';

--------------------draft

INSERT INTO likes(post_id, user_id) VALUES('1', '2');
SELECT * from likes where like_id = '8ae8ef14-b048-4e67-9cee-e6b1df0da6cc',
UPDATE likes SET likes = +1 where post_id='1';




  CREATE TABLE likes(
    like_id VARCHAR DEFAULT gen_random_uuid(),
    user_id VARCHAR[], 
    likes INT DEFAULT 0,
    post_id VARCHAR

  );


    CREATE TABLE users(
     username VARCHAR,
    user_id VARCHAR DEFAULT gen_random_uuid(), 
     isLiked BOOLEAN DEFAULT false

  );

  --ARRAYS


INSERT INTO likes (user_id)
VALUES(ARRAY ['2']) where user_id = '2'; -- add array

INSERT INTO users(username) VALUES('1');


UPDATE likes SET user_id = array_append(user_id, '330') WHERE like_id='17c1f545-21ff-4f0b-9c20-dfa3de1f35e4';

--add to an existing array

SELECT * FROM likes WHERE '330' = ANY(user_id); --search



ALTER TABLE likes
DROP CONSTRAINT likes_user_id_key;