const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "password",
        database: "employees_db"
    },
    console.log("Connected to the employees_db database.")
);

const start = () => {
    inquirer.prompt({
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
            "Exit"
        ]
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









