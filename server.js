// dependencies
const inquirer = require("inquirer");
const mysql = require("mysql2");
// console.table for displaying mysql data in a table format
const cTable = require("console.table");
const dotenv = require("dotenv");

// dotenv config to use .env file
dotenv.config();

// mysql connection uses .env file. (see .env.EXAMPLE)
const db = mysql.createConnection({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// connect to mysql
db.connect((err) => {
  if (err) throw err;
  start();
});

// start function for inquirer prompts
const start = () => {
  // inquirer prompt for user to select what they would like to do
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
    // switch statement for user selection to run appropriate function
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

// view all employees function using a join to display all employee data from multiple tables
const viewAllEmployees = () => {
  console.log("Viewing all employees");
  // query to join all employee data from multiple tables and display in a table format using console.table
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

// view all employees by department 
const viewAllEmployeesByDepartment = () => {
  console.log("Viewing all employees by department");
  // query department table to get all departments and display in a list for user to select
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
        // query to join all employee data from multiple tables and display in a table format using console.table. the query is filtered by the department selected by the user
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

// view all employees by manager function using a join to display all employee data from multiple tables
const viewAllEmployeesByManager = () => {
  console.log("Viewing all employees by manager");

  // query employee table to get all managers and display in a list for user to select. all managers have a manager_id of 7 in the database. 7 represents the current president
  db.query(
    `
    SELECT id, first_name, last_name 
    FROM employee
    WHERE manager_id = 7
    `,
    (err, results) => {
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
          // query to join all employee data from multiple tables and display in a table format using console.table. the query is filtered by the manager selected by the user
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

// add employee function grabbing data from role and employee tables to populate choices for inquirer
const addEmployee = () => {
  console.log("Adding employee");
  // query role table to get all roles and display in a list for user to select. the role id is used to assign the role to the employee
  db.query(`SELECT * FROM role`, (err, roleResults) => {
    let roles = roleResults.map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
    // query all employees where the manager id is 7. this is the current president. the employee id is used to assign the manager to the employee
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
            // query to insert new employee into employee table
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

// remove employee function grabbing data from employee table to populate choices for inquirer
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
        // query to delete employee from employee table
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

// update employee role function grabbing data from employee and role tables to populate choices for inquirer
const updateEmployeeRole = () => {
  console.log("Updating employee role");
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

// update employee manager function grabbing data from employee table to populate choices for inquirer
const updateEmployeeManager = () => {
  console.log("Updating employee manager");
  db.query(`SELECT * FROM employee`, (err, employeeResults) => {
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
  });
};

// view all roles function joining role and department tables to display department name instead of id
const viewAllRoles = () => {
  // query to join role and department tables
  db.query(
    `SELECT role.title, department.name AS department_name
    FROM role
    JOIN department
    ON role.department_id = department.id`,
    (err, results) => {
      if (err) throw err;
      console.table(results);
      start();
    }
  );
};

// add role function grabbing data from department table to populate choices for inquirer
const addRole = () => {
  inquirer
    .prompt([
      {
        name: "title",
        type: "input",
        message: "What is the title of the role you want to add?",
      },
      {
        name: "salary",
        type: "input",
        message: "What is the salary for the role you want to add?",
      },
      {
        name: "department_id",
        type: "input",
        message: "What is the department id for the role you want to add?",
      },
    ])
    .then((answers) => {
      // query to insert role into role table with user input from inquirer
      db.query(
        `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`,
        [answers.title, answers.salary, answers.department_id],
        (err) => {
          if (err) throw err;
          console.log("Role added!");
          start();
        }
      );
    });
};


const removeRole = () => {
  // query role table to get all roles and display in a list for user to select
  db.query("SELECT * FROM role", (err, roleResults) => {
    let roles = roleResults.map((role) => {
      return {
        name: role.title,
        value: role.id,
      };
    });
    inquirer
      .prompt([
        {
          name: "role",
          type: "list",
          message: "Which role do you want to remove?",
          choices: roles,
        },
      ])
      .then((answers) => {
        // query to delete role from role table with user input from inquirer
        db.query(`DELETE FROM role WHERE id = ?`, [answers.role], (err) => {
          if (err) throw err;
          console.log("Role removed!");
          start();
        });
      });
  });
};


const viewAllDepartments = () => {
  // query department table to get all departments
  db.query("SELECT * FROM department", (err, results) => {
    if (err) throw err;
    console.table(results);
    start();
  });
};

// add department function grabbing data from department table to populate choices for inquirer
const addDepartment = () => {
  inquirer
    .prompt({
      name: "departmentName",
      type: "input",
      message: "Enter the name of the department:",
    })
    .then((answer) => {
      const departmentName = answer.departmentName;
      // query to insert department into department table with user input from inquirer
      db.query(
        `INSERT INTO department (name) VALUES (?)`,
        departmentName,
        (err, results) => {
          if (err) throw err;
          console.log(`Department ${departmentName} added successfully!`);
          start();
        }
      );
    });
};


const removeDepartment = () => {
  // query department table to get all departments and display in a list for user to select
  db.query("SELECT * FROM department", (err, departmentResults) => {
    let departments = departmentResults.map((department) => {
      return {
        name: department.name,
        value: department.id,
      };
    });
    inquirer
      .prompt([
        {
          name: "department",
          type: "list",
          message: "Which department do you want to remove?",
          choices: departments,
        },
      ])
      .then((answers) => {
        // query to delete department from department table with user input from inquirer
        db.query(
          `DELETE FROM department WHERE id = ?`,
          [answers.department],
          (err) => {
            if (err) throw err;
            console.log("Department removed!");
            start();
          }
        );
      });
  });
};


const viewTotalUtilizedBudget = () => {
// view total utilized budget function joining employee, role, and department tables to display department name instead of id and sum of salaries for each department
  db.query(
    "SELECT department.name, SUM(role.salary) AS total_budget FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id GROUP BY department.name;",
    (err, results) => {
      if (err) throw err;
      console.table(results);
      start();
    }
  );
};
