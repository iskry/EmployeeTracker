Use shinra_db;

INSERT INTO department (name) VALUES ("Shin-Ra's Science & Research Division"), ("Space Program"), ("SOLDIER");

INSERT INTO role (title, salary, department_id) VALUES 
("Shinra Infrantryman", 5000, 3),
("SOLDIER 1st Class", 15000, 3),
("Astronaut", 8000, 2),
("Head of the Space Program", 20000, 2),
("Head of Shin-Ra's Science & Research Division", 50000, 1),
("Class A Biotechnologist", 15000, 1);



INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
("Cloud", "Strife", 1, 2),
("Sephiroth", null, 2, null),
("Cid", "Highwind", 3, 4),
("Palmer", null, 4, null),
("Hojo", null, 5, null),
("Lucrecia", "Crescent", 6, 5);





