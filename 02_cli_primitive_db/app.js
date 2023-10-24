import fs from "fs";
import inquirer from "inquirer";

const databasePath = 'database.txt';

let database = [];
if (fs.existsSync(databasePath)) {
    const data = fs.readFileSync(databasePath, 'utf8');
    if (data) {
        try {
            database = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing the JSON data:', error);
        }
    }
}

const addUser = () => {
    inquirer
        .prompt([
            {
                name: 'name',
                message: 'Enter the name of the user (press ENTER to stop adding users):',
            },
            {
                name: 'gender',
                type: 'list',
                message: 'Choose the gender:',
                choices: ['Male', 'Female'],
                when: (answers) => answers.name !== '',
            },
            {
                name: 'age',
                message: 'Enter the age:',
                when: (answers) => answers.name !== '',
            },
        ])
        .then((answers) => {
            if (answers.name !== '') {
                database.push(answers);
                fs.writeFileSync(databasePath, JSON.stringify(database));
                addUser();
            } else {
                searchUser();
            }
        });
};

const searchUser = () => {
    inquirer
        .prompt([
            {
                name: 'searchName',
                message: 'Search for a user by name:',
            },
            {
                name: 'continue',
                type: 'confirm',
                message: 'Do you want to continue searching?',
            },
        ])
        .then((answers) => {
            const searchName = answers.searchName.toUpperCase();
            const foundUsers = database.filter((user) => user.name.toUpperCase() === searchName);
            if (foundUsers.length > 0) {
                console.log('User(s) found:');
                foundUsers.forEach((user) => {
                    console.log('Name:', user.name);
                    console.log('Gender:', user.gender);
                    console.log('Age:', user.age);
                    console.log('---------------------------');
                });
            } else {
                console.log('No user found with that name.');
            }

            if (answers.continue) {
                searchUser();
            } else {
                console.log('Exiting the program.');
            }
        });
};

addUser();
