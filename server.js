const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  start();
});

const start = () => {
  inquirer
    .prompt({
      name: "start",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all employees",
        "View all employees by department",
        "View all employees by manager",
        "Add employee",
        "Remove employee",
        "Update employee role",
        "Update employee manager",
        "View all roles",
        "Add role",
        "Remove role",
        "View all departments",
        "Add department",
        "Remove department",
        "View the total utilized budget of a department",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.start) {
        case "View all employees":
          viewAllEmployees();
          break;
        case "View all employees by department":
          viewAllEmployeesByDepartment();
          break;
        case "View all employees by manager":
          viewAllEmployeesByManager();
          break;
        case "Add employee":
          addEmployee();
          break;
        case "Remove employee":
          removeEmployee();
          break;
        case "Update employee role":
          updateEmployeeRole();
          break;
        case "Update employee manager":
          updateEmployeeManager();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "Add role":
          addRole();
          break;
        case "Remove role":
          removeRole();
          break;
        case "View all departments":
          viewAllDepartments();
          break;
        case "Add department":
          addDepartment();
          break;
        case "Remove department":
          removeDepartment();
          break;
        case "View the total utilized budget of a department":
          viewTotalUtilizedBudget();
          break;
        case "Exit":
          db.end();
          break;
      }
    });
};

const viewAllEmployees = () => {
  console.log("Viewing all employees");
  db.query(
    `
    SELECT e.id, e.first_name, e.last_name, role.title, department.name, m.first_name AS manager_first_name, m.last_name AS manager_last_name
    FROM employee e
    JOIN role ON e.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT OUTER JOIN employee m ON e.manager_id = m.id
    `,
    (err, results) => {
      if (err) throw err;
      console.table(results);
      start();
    }
  );
};

const viewAllEmployeesByDepartment = () => {
  db.query(`SELECT * FROM department`, (err, results) => {
    let departments = results.map((department) => {
      return {
        name: department.name,
        value: department.id,
      };
    });
    inquirer
      .prompt({
        name: "department",
        type: "list",
        message: "Which department would you like to view?",
        choices: departments,
      })
      .then((answer) => {
        db.query(
          `
            SELECT e.id, e.first_name, e.last_name, role.title, department.name, m.first_name AS manager_first_name, m.last_name AS manager_last_name
            FROM employee e
            JOIN role ON e.role_id = role.id
            JOIN department ON role.department_id = department.id
            LEFT OUTER JOIN employee m ON e.manager_id = m.id
            WHERE department.id = ?
            `,
          answer.department,
          (err, results) => {
            if (err) throw err;
            console.table(results);
            start();
          }
        );
      });
  });
};

const viewAllEmployeesByManager = () => {
  db.query(
    `
    SELECT id, first_name, last_name 
    FROM employee
    WHERE manager_id = 7
    `,
    (err, results) => {
      console.log(results);
      let managers = results.map((manager) => {
        return {
          name: manager.first_name + " " + manager.last_name,
          value: manager.id,
        };
      });
      inquirer
        .prompt({
          name: "manager",
          type: "list",
          message: "Which manager would you like to view?",
          choices: managers,
        })
        .then((answer) => {
          console.log(answer);
          db.query(
            `
            SELECT e.id, e.first_name, e.last_name, role.title, department.name, m.first_name AS manager_first_name, m.last_name AS manager_last_name
            FROM employee e
            JOIN role ON e.role_id = role.id
            JOIN department ON role.department_id = department.id
            LEFT OUTER JOIN employee m ON e.manager_id = m.id
            WHERE m.id = ?
            `,
            answer.manager,
            (err, results) => {
              if (err) throw err;
              console.table(results);
              start();
            }
          );
        });
    }
  );
};

const addEmployee = () => {
  db.query(`SELECT * FROM role`, (err, roleResults) => {
    let roles = roleResults.map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
    db.query(
      `SELECT * FROM employee WHERE manager_id = 7`,
      (err, employeeResults) => {
        let managers = employeeResults.map((employee) => {
          return {
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
          };
        });
        inquirer
          .prompt([
            {
              name: "firstName",
              type: "input",
              message: "What is the employee's first name?",
            },
            {
              name: "lastName",
              type: "input",
              message: "What is the employee's last name?",
            },
            {
              name: "role",
              type: "list",
              message: "What is the employee's role?",
              choices: roles,
            },
            {
              name: "manager",
              type: "list",
              message: "Who is the employee's manager?",
              choices: managers,
            },
          ])
          .then((answers) => {
            db.query(
              `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`,
              [
                answers.firstName,
                answers.lastName,
                answers.role,
                answers.manager,
              ],
              (err) => {
                if (err) throw err;
                console.log("Employee added!");
                start();
              }
            );
          });
      }
    );
  });
};

const removeEmployee = () => {
    db.query(`SELECT * FROM employee`, (err, employeeResults) => {
        let employees = employeeResults.map((employee) => {
          return {
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
          };
        });
        inquirer
          .prompt([
            {
              name: "employee",
              type: "list",
              message: "Which employee do you want to remove?",
              choices: employees,
            },
          ])
          .then((answers) => {
            db.query(
              `DELETE FROM employee WHERE id = ?`,
              [answers.employee],
              (err) => {
                if (err) throw err;
                console.log("Employee removed!");
                start();
              }
            );
          });
    });
};

const updateEmployeeRole = () => {
    db.query(`SELECT * FROM employee`, (err, employeeResults) => {
        let employees = employeeResults.map((employee) => {
          return {
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
          };
        });
        db.query(`SELECT * FROM role`, (err, roleResults) => {
            let roles = roleResults.map((role) => {
              return {
                name: role.title,
                value: role.id,
              };
            });
            inquirer
              .prompt([
                {
                  name: "employee",
                  type: "list",
                  message: "Which employee's role do you want to update?",
                  choices: employees,
                },
                {
                  name: "role",
                  type: "list",
                  message: "What is the new role for the employee?",
                  choices: roles,
                },
              ])
              .then((answers) => {
                db.query(
                  `UPDATE employee SET role_id = ? WHERE id = ?`,
                  [answers.role, answers.employee],
                  (err) => {
                    if (err) throw err;
                    console.log("Employee role updated!");
                    start();
                  }
                );
              });
        });
    });
};

const updateEmployeeManager = () => {
    db.query(
        `SELECT * FROM employee`,
        (err, employeeResults) => {
            let employees = employeeResults.map((employee) => {
                return {
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id,
                };
            });
            db.query(
                `SELECT * FROM employee WHERE manager_id = 7`,
                (err, managerResults) => {
                    let managers = managerResults.map((manager) => {
                        return {
                            name: `${manager.first_name} ${manager.last_name}`,
                            value: manager.id,
                        };
                    });
                    inquirer
                        .prompt([
                            {
                                name: "employee",
                                type: "list",
                                message: "Which employee would you like to update?",
                                choices: employees,
                            },
                            {
                                name: "manager",
                                type: "list",
                                message: "Who is the employee's new manager?",
                                choices: managers,
                            },
                        ])
                        .then((answers) => {
                            db.query(
                                `UPDATE employee SET manager_id = ? WHERE id = ?`,
                                [answers.manager, answers.employee],
                                (err) => {
                                    if (err) throw err;
                                    console.log("Employee updated!");
                                    start();
                                }
                            );
                        });
                }
            );
        }
    );
};

const viewAllRoles = () => {
    db.query(`SELECT role.title, department.name AS department_name
    FROM role
    JOIN department
    ON role.department_id = department.id`, (err, results) => {
        if (err) throw err;
        console.table(results);
        start();
    });
};


const addRole = () => {
  db.query("SELECT * FROM role", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

const removeRole = () => {
  db.query("SELECT * FROM role", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

const viewAllDepartments = () => {
  db.query("SELECT * FROM department", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

const addDepartment = () => {
  db.query("SELECT * FROM department", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

const removeDepartment = () => {
  db.query("SELECT * FROM department", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

const viewTotalUtilizedBudget = () => {
  db.query("SELECT * FROM department", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};
