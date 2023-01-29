Use shinra_db;

INSERT INTO department (name) VALUES ("Shin-Ra's Science & Research Division"), ("Space Program"), ("SOLDIER"), ("Shinra Electric Power Company");

INSERT INTO role (title, salary, department_id) VALUES 
("Shinra Infrantryman", 5000, 3),
("SOLDIER 1st Class", 15000, 3),
("Astronaut", 8000, 2),
("Head of the Space Program", 20000, 2),
("Head of Shin-Ra's Science & Research Division", 50000, 1),
("Class A Biotechnologist", 15000, 1),
("President", 1000000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
("Cloud", "Strife", 1, 2),
("Sephiroth", "Nō shōgai", 2, 7),
("Cid", "Highwind", 3, 4),
("Palmer", "Arnold", 4, 7),
("Hojo", "Bojo", 5, 7),
("Lucrecia", "Crescent", 6, 5),
("Rufus", "Shinra", 7, 7);




