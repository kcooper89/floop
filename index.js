const mysql = require("mysql");
const inquirer = require("inquirer");
// create the connection information for the sql database
const connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "password",
  database: "employees",
});
connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});
function start() {
  inquirer
    .prompt({
      name: "userInput",
      type: "list",
      message:
        "Would you like to view [VIEW DEPARTMENTS], [VIEW ROLES], [VIEW EMPLOYEES], [ADD DEPARTMENTS], [ADD ROLES], [ADD EMPLOYEES] [EXIT]?",
      choices: ["VIEW_DEPARTMENTS", "VIEW_ROLES", "VIEW_EMPLOYEES", "ADD_DEPARTMENTS", "ADD_ROLES", "ADD_EMPLOYEES", "DELETE_EMPLOYEE", "EXIT"],
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.userInput === "VIEW_DEPARTMENTS") {
        viewDepartments();
      } else if (answer.userInput === "VIEW_ROLES") {
        viewRoles();
      } else if (answer.userInput === "VIEW_EMPLOYEES") {
        viewEmployees();
      } else if (answer.userInput === "ADD_DEPARTMENTS") {
        addDepartment();
      } else if (answer.userInput === "ADD_ROLES") {
        addRole();
      } else if (answer.userInput === "ADD_EMPLOYEES") {
        addEmployee();
      } else if (answer.userInput === 'DELETE_EMPLOYEE') {
        deleteEmployee();
      }
      else {
        connection.end();
      }
    });
}
function viewDepartments() {
  connection.query("SELECT * FROM department", function (err, results) {
    if (err) throw err;
    console.table(results);
    start();
  });
}
function viewRoles() {
  connection.query(
    `select title, salary, name from role 
    inner join department on role.department_id=department.id`,
    function (err, results) {
      if (err) throw err;
      console.table(results);
      start();
    }
  );
}
function viewEmployees() {
  connection.query(
    `select first_name, last_name, title, salary, name from employee 
    inner join role on employee.role_id=role.id 
    inner join department on role.department_id=department.id`,
    function (err, results) {
      if (err) throw err;
      console.table(results);
      start();
    }
  );
}
function printResults (err, result) {
    if (err) throw err;
    console.log(result);
    start();
}
async function addDepartment () {
    const department = await inquirer.prompt([
        {
            name: "name",
            message: "What is the name of the department"
        }
    ])
    connection.query (`insert into department (name) values ('${department.name}')`, printResults )
}
function addRole() {
    connection.query ("select * from department", async function(err, results) {
        const departments = results.map ( (result) => ({
            name:result.name, 
            value:result.id
        }) )
        const roleInfo = await inquirer.prompt([
            {
                name: "title",
                message: "What is the title for the position"
            },
            {
                name: "salary",
                message: "What is the salary for the position"
            },
            {
                type: "list",
                name: "department_id",
                message: "Which Department does the role belong to?",
                choices:departments 
            }
        ])
        connection.query (`insert into role (title, salary, department_id) values('${roleInfo.title}','${roleInfo.salary}','${roleInfo.department_id}' )`, printResults)
    })
}
function addEmployee() {
    connection.query ("select * from role", async function(err, results) {
        const roles = results.map ( (result) => ({
            name:result.title, 
            value:result.id
        }) )
        const employeeInfo = await inquirer.prompt([
            {
                name: "first_name",
                message: "What is the first name of the employee"
            },
            {
                name: "last_name",
                message: "What is the last name of the employee"
            },
            {
                type: "list",
                name: "role_id",
                message: "What is the employee's role?",
                choices:roles 
            }
        ])
        connection.query (`insert into employee (first_name, last_name, role_id) values('${employeeInfo.first_name}','${employeeInfo.last_name}','${employeeInfo.role_id}' )`, printResults)
    })
}
function deleteEmployee() {
  inquirer
  .prompt([
    {
      name: "first_name",
      message: "What is the first name of the employee"
    },
    {
        name: "last_name",
        message: "What is the last name of the employee"
    },
  ]).then(function(answers) {
    connection.query(`select * from employee WHERE first_name="${answers.first_name}" AND last_name="${answers.last_name}"`, function(err, employees) {
      if (err) {
        console.error(err)
      } else {
        connection.query (`delete from employee where id = ${employees[0].id}`, function(err, employee) {
          if (err) {
            console.error(err)
          } else {
            console.log('Successfully removed employee.');
            start();
          }
        });
      }
    })
  })
}